/*
 * File: parser.js
 * This file contains functionality to fetch data from the 3 
 * data sources depending upon the options passed to it. It then
 * parses the xml and produces an aggrigated json which is returned.
 */

var request = require('request');
var parseXml = require('xml2js').parseString;
var $ = require('jquery-deferred');
var _ = require('underscore');
var applicationCredentials = require('./applicationCredentials');

exports.Parser = function(options) {

    var ttlcData;
    var youtubeData;
    var blogData;
    var contentDef;
    var results = [];

    var resultJson = {
        'title': null,
        'description': null,
        'thumbnail': null,
        'date': null,
        'url': null
    };

    /**
     * Contains maping of various possible search tearms to the 
     * category. This is necessary for the learning algorithm
     * 
     */
    var getCategory = function(input) {
        var married  = ['marriage', 'married'];
        var house    = ['home', 'housing'];
        var children = ['kids','child', 'family'];

        if ( _.contains(married, input) )
            return "married";

        if ( _.contains(house,input) )
            return "house";

        if ( _.contains(children, input) )
            return "children";
    };

    /*
     * fetch content from ttlc based on ttlc. Aggregate content
     * and return a deferred
     */    
    var ttlc = function(params) {
        var def = $.Deferred();
        var data = [];
        var count = 0;
        for ( var i = 0 ; i < params.tags.length ; i++ ) {
            var url = 'https://ttlc.intuit.com/tags/' + params.tags[i] + '.rss';
            var qs = {
                'filter': 'all_questions',
                'sort': 'popularity',
                'page': params.page
            }
            request(url, function (error, response, body) {
                // parseThisXml(def, body);
                parseXml(body, function(err, result) {

                    //add category
                    var tmp = result.rss.channel[0].item;
                    _.each(tmp, function(ele) {
                        ele.category = getCategory(params.tags[count]);
                    });

                    data = data.concat(tmp);
                    count++;

                    if (count == params.tags.length) 
                        def.resolve(data);
                });
            });
        }
        return def;
    };

    /**
     * fetches data from turbotax blog, aggregates it and returns def
     * @param  search params
     * @return deferred object
     */
    var blog = function(params) {
        var data = [];
        var count = 0;
        var def = $.Deferred();
        for ( var i = 0 ; i < params.length ; i++ ) {
            var url = 'http://blog.turbotax.intuit.com/category/tax-deductions-and-credits-2/' + params[i] + "/feed";
            request(url, function (error, response, body) {
                parseXml(body, function(err, result) {
                    var tmp = result.rss.channel[0].item;

                    //adding category
                    _.each(tmp, function(ele) {
                        ele.category = getCategory(params[count]);
                    });

                    data = data.concat(tmp);
                    count++;

                    if (count == params.length)
                        def.resolve(data);
                });
            });
        }
        return def;
    };

    /**
     * gets content from the youtube api for provided
     * search panel , aggregates it and returns the def
     * 
     * @param  search params
     * @return def
     */
    var youtube = function(params) {
        var def = $.Deferred();
        var searchString = [];
        var count = 0;
        var results = [];

        _.each(params, function(ele) {
            searchString.push(ele);
        });

        for ( var i = 0 ; i < params.length ; i++ ) {
            var url = 'https://www.googleapis.com/youtube/v3/search';
            var qs = {
                'part': 'id',
                'q': searchString[i],
                'key': applicationCredentials.youtubeKey,
                'channelId': 'UCJdqltkDxOUIvkVlaluFjSw' 
            };

            request({url: url, qs: qs}, function (error, response, body) {
                var tmp = JSON.parse(body).items;

                //set category for each item
                _.each(tmp, function(ele) {
                    ele.category = getCategory(params[count]);
                })
                results = results.concat(tmp);
                count++;
                if ( count == params.length ) {
                    def.resolve(results);
                }
            });
        }

        return def;
    };

    /**
     * public method to fetch ttlc content
     *
     * @param  search params
     * @return ttlc
     */
    this.fetchTtlc = function(params) {
        return ttlc(params);
    };

    /**
     * method invoked to get aggregate data from all 3 streams.
     * 
     * @return def
     */
    this.fetchContent = function() {

        contentDef = $.Deferred();

        $.when(ttlc(options.ttlc), blog(options.ttblog), youtube(options.youtube)).done(function(ttlc, blog, youtube) {

            _.each(ttlc, function(ele) {
                results.push({
                    'description': ele.description,
                    'title': ele.title,
                    'date': ele.pubDate,
                    'url': ele.link,
                    'type': 'ttlc',
                    'category': ele.category
                });
            });

            _.each(blog, function(ele) {
                results.push({
                    'url': ele.link,
                    'title': ele.title,
                    'pubDate': ele.pubDate,
                    'description': ele.description,
                    'type': 'ttblog',
                    'thumbnail': ele["media:content"][0].$.url,
                    'category': ele.category
                });
            });

            _.each(youtube, function(ele) {
                results.push({
                    'url': 'http://www.youtube.com/embed/' + ele.id.videoId,
                    'thumbnail': 'https://img.youtube.com/vi/' +  ele.id.videoId + '/0.jpg',
                    'type': 'youtube',
                    'category': ele.category
                });
            });

            contentDef.resolve(results);

        });

        return contentDef;

    }
};