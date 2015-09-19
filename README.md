#Intuit Hackathon 

2.TurboTax AnswerXchange  
3.TurboTax YouTube Channel  

## Aggregation
This app pulls latest data from the three sources.  
For TurboTax Blog the RSS feed is used for example the url looks like this blog.turbotax.intuit.com/category/tax-deductions-and-credits-2/family/feed  
For TurboTax AnswerXchange we pull from the RSS feed as well using tags for example a url looks like this https://ttlc.intuit.com/tags/married.rss?filter=all_questions&sort=popularity&page=2  
For TurboTax YouTube channel it pulls a JSON from the YouTube v3 API.  

## Recommendation System
This app carefully listens to what articles you read and builds recommendations based on your preferences. 
Each time you click on an article it records some metric which is later processed and used to recommend similar articles. To test it out simply click on articles with the same tag ie 'marriage' 'house' 'children' and then hit Recommend More Stories and it would fetch it based on your preference.

## Build Instructions
First create a file called `./lib/applicationCredentials.js`  
Enter the following values.  
`exports.databaseUrl = "YOUR_DATA_BASE_URL";  
exports.cookieEncryptionKey = "YOUR_ENCRYPTION_KEY";  
exports.youtubeKey = "YOUR_YOUTUBE_API_KEY"`

Now Simply run `node app.js`