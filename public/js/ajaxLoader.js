/**
 * File: ajaxLoader.js
 * Contains client side code for viewing feeds.
 * Holds event listeners and localStoage access APIs.
 */

/**
 * Youtube base url
 */
var youtubeBaseUrl = "http://www.youtube.com/embed/";
$(document).ready(function(){
  sessionStorage.clear();
  /**
   * Setup event hanlder on Recommend More Stories button.
   */
	$('.load-more-stories').click(function(){
    if (typeof(Storage) !== "undefined") {
        /**
         * Setup post data for posting user preferences based on what the user clicks on.
         */
        var categories = ['married','house','children'];
        var userInterest = {};
        if(typeof(Storage) !== "undefined") {
          for(var i in categories) {
            if(sessionStorage[categories[i]]) {
              userInterest[categories[i]] = sessionStorage[categories[i]];
            }else {
              userInterest[categories[i]] = 1;
            }
          }    
        } 
      /**
       * POST current users preferences to fetch more stories accordingly.
       * @param  {JSON} User preferences.
       */
      $.post( "/getMoreStories", userInterest, function( data ) {

        _.each(data,function(ele){
          //Construct each div for feed
          var feed = document.createElement('div');
          //Set meta data about the article
          feed.setAttribute('class','feed');
          feed.setAttribute('data-url',ele.url);
          feed.setAttribute('category',ele.category);
          //Render the article
          if(ele.type == 'youtube') {
            var iframe = document.createElement('iframe');            
            iframe.setAttribute('src',ele.url);            
            feed.appendChild(iframe);
            if (ele.category == "married")
              $(feed).append("<span class='label label-success'> marriage </span>");
            else
              $(feed).append("<span class='label label-success'> "+ele.category+"</span>");
          }else {
            var title = document.createElement('h3');
            var thumbnail = document.createElement('img');
            var description = document.createElement('p');

            if(ele.title) {
              title.innerHTML = ele.title;
              if (ele.category == "married")
                $(title).append("<span class='label label-success'> marriage </span>");
              else
                $(title).append("<span class='label label-success'> "+ele.category+"</span>");
            }
              
            if(ele.thumbnail)
              thumbnail.setAttribute('src',ele.thumbnail);
            if(ele.description)
              description.innerHTML = ele.description;

            feed.appendChild(title);
            feed.appendChild(thumbnail);
            feed.appendChild(description);
          }
          $('.feed').last().after(feed);
          
        });
        sessionStorage.clear();
        bindAll();
    });
    } else {
      console.log("Sorry your browser does not support localStorage");
    }
	
	});	

/**
 * Record user clicks on each article.
 * Once the click metric is recorede open the article for the user in a new tab.
 */
  function bindAll() {
    $('.feed').click(function() {
        var category = $(this).attr('category');
        if(typeof(Storage) !== "undefined") {
          if(sessionStorage[category]) {
            sessionStorage[category] = Number(sessionStorage[category]) + 1;
          }else {
            sessionStorage[category] = 1;
          }               
        }else {
          console.log("Please update your browser");
        }
        var win = window.open( $(this).attr('data-url'),'_blank');
    });
  }

  bindAll();

});