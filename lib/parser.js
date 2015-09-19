var request = require('request');
var parseXml = require('xml2js').parseString;
var $ = require('jquery-deferred');
var _ = require('underscore');

// var xml = "<item><title>Excess Roth contributions for 2011, 2012, 2013, and 2014. What to do.</title><link>https://ttlc.intuit.com/questions/2901554-excess-roth-contributions-for-2011-2012-2013-and-2014-what-to-do</link><description>&lt;p&gt;I got married June 2011 but my wife kept contributing the maximum amount ($5.000 per year) to her Roth IRA account. We have withdrawn these contributions + earnings in June, 2015. We know the earnings for each year.&amp;nbsp;&lt;/p&gt;&lt;p&gt;Can you give us a precise how to report this. I assume we have to send in amended returns for each year? &amp;nbsp; &amp;nbsp;&lt;/p&gt;</description><guid isPermaLink=\"true\">https://ttlc.intuit.com/questions/2901554</guid><pubDate>Fri, 14 Aug 2015 18:22:46 +0000</pubDate></item>";

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
    
    var ttlc = function() {        
        var def = $.Deferred();
        request('https://ttlc.intuit.com/tags/married.rss?filter=all_questions&sort=popularity&page=5', function (error, response, body) {
            parseThisXml(def, body);
        });

        return def;
    };

    var blog = function() {
        var def = $.Deferred();
        request('http://blog.turbotax.intuit.com/category/tax-deductions-and-credits-2/education/feed', function (error, response, body) {
            parseThisXml(def, body);
        });

        return def;
    };

    var youtube = function() {
        var def = $.Deferred();
        request('https://www.googleapis.com/youtube/v3/search?part=id&q=marriage|housing|kids&key=AIzaSyD9OCDflrpo5n0QC1zM4fX5TJmJQg347sU&channelId=UCJdqltkDxOUIvkVlaluFjSw', function (error, response, body) {
            body = JSON.parse(body);
            def.resolve(body.items);
        });

        return def;
    };

    this.fetchContent = function() {

        contentDef = $.Deferred();

        $.when(ttlc(), blog(), youtube()).done(function(ttlc, blog, youtube) {

            _.each(ttlc, function(ele) {
                results.push({
                    'description': ele.description,
                    'title': ele.title,
                    'date': ele.pubDate,
                    'url': ele.link
                });
            });

            _.each(blog, function(ele) {
                results.push({
                    'url': ele.link,
                    'title': ele.title,
                    'pubDate': ele.pubDate,
                    'description': ele.description
                });
            });

            _.each(youtube, function(ele) {
                results.push({
                    'url': 'www.youtube.com/watch?v=' + ele.id.videoId,
                    'thumbnail': 'https://img.youtube.com/vi/' +  ele.id.videoId + '/0.jpg'
                });
            });

            contentDef.resolve(results);

        });

        return contentDef;

    }

};