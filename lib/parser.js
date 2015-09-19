var request = require('request');
var parseXml = require('xml2js').parseString;
var $ = require('jquery-deferred');
var _ = require('underscore');
var appCreds = require('./applicationCredentials');

var Parser = function(options) {

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

    var parseThisXml = function (def, xml) {
        parseXml(xml, function(err, result) {
            def.resolve(result.rss.channel[0].item);
        });
    };
    
    this.ttlc = function(params) {
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
                    data = data.concat(result.rss.channel[0].item);
                    count++;
                    if (count == params.tags.length)
                        def.resolve(data);
                });
            });
        }
        return def;
    };

    var blog = function(params) {
        var data = [];
        var count = 0;
        var def = $.Deferred();
        for ( var i = 0 ; i < params.length ; i++ ) {
            var url = 'http://blog.turbotax.intuit.com/category/tax-deductions-and-credits-2/' + params[i] + "/feed";
            request(url, function (error, response, body) {
                parseXml(body, function(err, result) {
                    data = data.concat(result.rss.channel[0].item);
                    count++;
                    debugger;
                    if (count == params.length)
                        def.resolve();
                });
            });
        }
        return def;
    };

    var youtube = function(params) {
        var def = $.Deferred();
        var searchString = '';

        _.each(params, function(ele) {
            searchString += ele + '|';
        });
        //remove last element
        searchString = searchString.substring(0, searchString.length-1);

        var url = 'https://www.googleapis.com/youtube/v3/search';
        var qs = {
            'part': 'id',
            'q': 'options.string',
            'key': appCreds.youtube.key
        }

        request({url: url, qs: qs}, function (error, response, body) {
            body = JSON.parse(body);
            def.resolve(body.items);
        });

        return def;
    };

    this.fetchContent = function() {

        contentDef = $.Deferred();

        $.when(this.ttlc(options.ttlc), blog(options.ttblog), youtube(options.youtube)).done(function(ttlc, blog, youtube) {

            _.each(ttlc, function(ele) {
                results.push({
                    'description': ele.description,
                    'title': ele.title,
                    'date': ele.pubDate,
                    'url': ele.link,
                    'type': 'ttlc'
                });
            });

            _.each(blog, function(ele) {
                results.push({
                    'url': ele.link,
                    'title': ele.title,
                    'pubDate': ele.pubDate,
                    'description': ele.description,
                    'type': 'ttblog'
                });
            });

            _.each(youtube, function(ele) {
                results.push({
                    'url': 'www.youtube.com/embed/' + ele.id.videoId,
                    'thumbnail': 'https://img.youtube.com/vi/' +  ele.id.videoId + '/0.jpg',
                    'type': 'youtube'
                });
            });

            contentDef.resolve(results);

        });

        return contentDef;

    }
};

// var parser = new Parser({
//     'youtube': ['marriage', 'housing', 'kids'],
//     'ttlc': {
//         'tags': ['married', 'child'],
//         'page': 1
//     },
//     'ttblog': ['home','child']
// });

// parser.fetchContent().done(function(data) {
//     console.log(data);
// })

module.exports = Parser;