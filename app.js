var express = require('express');
var cookieParser = require('cookie-parser');
var um = require('./lib/userManagement.js');
var intuit = require('./lib/intuit.js');
var path = require('path');
var app = express();
app.use(cookieParser());

/**
 *Configure express
 */
app.use(express.static(path.join(__dirname, 'public')));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');


/**
 * Routes start
 */
app.get('/register', function (request, response) {
	response.render('register');
});

app.post('/addUser', function (request, response) {
	um.handleAddUser(request, response);
});

app.get('/login', function (request, response) {
	response.render('login');
});

app.get('/logout' , function ( request , response ) {
	um.logUserOut(request.cookies , response );
});

app.post('/authUser', function (request, response) {
	um.handleLogin(request, response);
});

app.get('/myFeed', function (request, response) {
	var userCookie = request.cookies;
	if( ((typeof userCookie.ecommit_email)==='undefined') || ((typeof userCookie.ecommit_passwordHash)==='undefined') ) {
		response.render('error',{message: "Please login to leave a review!"} );
		return false; // user is not logged in
	}else {
		intuit.showFeed(request, response);
	}
});

app.get('/getMoreStories', function (request,response){
	var x = [ { description: [ '' ],
    title: [ 'Is it possible to import multiple quicken files for one tax year (newly married we keep our accounts separate & use quicken on different computers) ?' ],
    date: [ 'Wed, 19 Aug 2015 13:10:00 +0000' ],
    url: [ 'https://ttlc.intuit.com/questions/2901924-is-it-possible-to-import-multiple-quicken-files-for-one-tax-year-newly-married-we-keep-our-accounts-separate-use-quicken-on-different-computers' ] },
  { description: [ 'my husbands being audited for 2014. me &amp; my husband got married on dec 27th well we filed single desperate returns something i over looked. well my husband supported my son all year while i barely work &amp; claimed my son. do i amend my taxes and include form 8332 so my husband as step father can claim my son? Or do we both amend and file joint.' ],
    title: [ 'my husbands audited.We got married dec27.filing single returns.My husband supported my son & claimed him.do i amend mine & do form8332 so stepdad can claim my son?' ],
    date: [ 'Wed, 19 Aug 2015 10:58:17 +0000' ],
    url: [ 'https://ttlc.intuit.com/questions/2901918-my-husbands-audited-we-got-married-dec27-filing-single-returns-my-husband-supported-my-son-claimed-him-do-i-amend-mine-do-form8332-so-stepdad-can-claim-my-son' ] },
  { description: [ '<p></p><p>\r\n\r\n</p><p>I have triple checked all info entered.&nbsp; Did the IRS simply not take out enough from\r\nour paychecks throughout the year?&nbsp;\r\nMortgage interest has always helped us out, but this year it did not\r\nseem to alter our amount owed at all?&nbsp;\r\nTurboTax does not take into account potential penalty fees and interest\r\nowed to the IRS, correct?</p>\r\n\r\n<p></p><br>' ],

    title: [ 'My wife and I both claimed married 0 for all of 2014.  We had quite a few deductions and still owe about $2,800?' ],
    date: [ 'Tue, 18 Aug 2015 16:53:53 +0000' ],
    url: [ 'https://ttlc.intuit.com/questions/2901839-my-wife-and-i-both-claimed-married-0-for-all-of-2014-we-had-quite-a-few-deductions-and-still-owe-about-2-800' ] },
  { description: [ '<p>She filed with an accountant, not with turbotax.</p><p>She filed married but separately. &nbsp;(since I wasn\'t ready)</p><p>She received her refund check already.</p><p>I do my taxes with turbotax.</p><p>I have all my W2s now and I want to file my taxes through turbotax, but it will save me 1000 dollars if we can file jointly.</p><p>Now that I\'m ready, can I amend her taxes and file jointly now through turbotax?</p><p>Or since she didn\'t use turbotax is it not possible?</p>' ],
    title: [ 'My wife filed her 2014taxes with an accountant, married filing separately. She got a refund. Can I amend her 2014 taxes and so I can file jointly through turbotax at all?' ],
    date: [ 'Tue, 18 Aug 2015 15:18:12 +0000' ],
    url: [ 'https://ttlc.intuit.com/questions/2901826-my-wife-filed-her-2014taxes-with-an-accountant-married-filing-separately-she-got-a-refund-can-i-amend-her-2014-taxes-and-so-i-can-file-jointly-through-turbotax-at-all' ] },
  { description: [ '' ],
    title: [ 'I am having trouble re-filing individual after filing initially as jointly married, however, TurboTax is not accepting my re-application.  Can you help me please?' ],
    date: [ 'Tue, 18 Aug 2015 15:13:30 +0000' ],
    url: [ 'https://ttlc.intuit.com/questions/2901824-i-am-having-trouble-re-filing-individual-after-filing-initially-as-jointly-married-however-turbotax-is-not-accepting-my-re-application-can-you-help-me-please' ] },
  { description: [ '' ],
    title: [ 'I am married however my spouse does not have a social security number yet. How can I file as married?' ],
    date: [ 'Sat, 28 Feb 2015 23:07:12 +0000' ],
    url: [ 'https://ttlc.intuit.com/questions/2753243-i-am-married-however-my-spouse-does-not-have-a-social-security-number-yet-how-can-i-file-as-married' ] },
  { description: [ '<p>Should both of us claim the deductions if we are married filing jointly.<br></p>' ],

    title: [ 'If my wife and I have full time employment and five children and  we claim 16 exemptions, no federal tax taken out. How many should we claim?' ],
    date: [ 'Wed, 29 Jul 2015 18:30:12 +0000' ],
    url: [ 'https://ttlc.intuit.com/questions/2900277-if-my-wife-and-i-have-full-time-employment-and-five-children-and-we-claim-16-exemptions-no-federal-tax-taken-out-how-many-should-we-claim' ] },
  { description: [ '<p>I got married June 2011 but my wife kept contributing the maximum amount ($5.000 per year) to her Roth IRA account. We have withdrawn these contributions + earnings in June, 2015. We know the earnings for each year.&nbsp;</p><p>Can you give us a precise how to report this. I assume we have to send in amended returns for each year? &nbsp; &nbsp;</p>' ],
    title: [ 'Excess Roth contributions for 2011, 2012, 2013, and 2014. What to do.' ],
    date: [ 'Fri, 14 Aug 2015 18:22:46 +0000' ],
    url: [ 'https://ttlc.intuit.com/questions/2901554-excess-roth-contributions-for-2011-2012-2013-and-2014-what-to-do' ] },
  { description: [ '' ],
    title: [ 'My husband and I seperated but still filed married jointly. Is the return to be split 50-50? Do I have a legal right to the half that he will not pay me?' ],
    date: [ 'Sun, 09 Aug 2015 00:31:37 +0000' ],
    url: [ 'https://ttlc.intuit.com/questions/2901105-my-husband-and-i-seperated-but-still-filed-married-jointly-is-the-return-to-be-split-50-50-do-i-have-a-legal-right-to-the-half-that-he-will-not-pay-me' ] },
  { description: [ 'I live in South Korea and got married last year. I will be using the foreign earned exclusion because I pay taxes in South Korea. My wife is a South Korean national who has never lived in the States and has no social security number. I&#39;m not trying to file jointly; but even though I select file separately, I am still prompted to enter my spouse&#39;s name and social security number. As she has no ssn, I&#39;ve tried to leave it blank, but the software continues to return to that screen during the review process and ask for her ssn. I tried entering NRA as some have suggested, but the software is not allowing me to enter letters. Should I leave blank and file as is, or is there a more correct way to handle it? Thank you for any help!' ],
    title: [ 'My spouse is a foreign national with no social security number. Some people recommend entering "NRA" but the Social Security Field only accepts numbers. What do I do?' ],
    date: [ 'Fri, 10 Apr 2015 09:32:18 +0000' ],
    url: [ 'https://ttlc.intuit.com/questions/2850831-my-spouse-is-a-foreign-national-with-no-social-security-number-some-people-recommend-entering-nra-but-the-social-security-field-only-accepts-numbers-what-do-i-do' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2015/08/20/is-this-deductible-going-back-to-school/' ],
    title: [ 'Is This Deductible? Going Back to School' ],
    pubDate: [ 'Thu, 20 Aug 2015 22:52:36 +0000' ],
    description: [ 'So you&#8217;ve made the decision to go back to school, and now you&#8217;ve got to figure out the finances. Time to find out what&#8217;s tax deductible and what kinds of tax benefits are available to you. No need to panic,... <p><a href="http://blog.turbotax.intuit.com/2015/08/20/is-this-deductible-going-back-to-school/" class="entry-more-link">Full Story</a></p><img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=20156&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2015/08/17/spent-too-much-getting-your-dorm-ready-4-savings-to-help-college-students-or-parents/' ],
    title: [ 'Spent Too Much Getting Your Dorm Ready? 4 Savings to Help College Students (or Parents)' ],
    pubDate: [ 'Mon, 17 Aug 2015 12:55:57 +0000' ],
    description: [ 'With a new college school year about to begin, it’s comforting to know that you’ll be getting some help from Uncle Sam in dealing with the blizzard of college related expenses that are hitting. The IRS provides a number of... <p><a href="http://blog.turbotax.intuit.com/2015/08/17/spent-too-much-getting-your-dorm-ready-4-savings-to-help-college-students-or-parents/" class="entry-more-link">Full Story</a></p><img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=20108&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2015/08/07/get-your-classroom-ready-five-tax-savings-tips-for-teachers-before-the-first-day-of-school/' ],
    title: [ 'Get Your Classroom Ready – Five Tax Savings Tips for Teachers Before The First Day of School' ],
    pubDate: [ 'Fri, 07 Aug 2015 23:10:15 +0000' ],
    description: [ 'Gosh, where has the summer gone? Just yesterday, it seems, school let out for the summer, and here we are going back to school. If the months continue to fly by like that, soon it will be the holidays, and... <p><a href="http://blog.turbotax.intuit.com/2015/08/07/get-your-classroom-ready-five-tax-savings-tips-for-teachers-before-the-first-day-of-school/" class="entry-more-link">Full Story</a></p><img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=20125&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2015/06/29/what-does-your-hairstyle-say-about-your-life/' ],
    title: [ 'What Does Your Hairstyle Say About Your Life? [Infographic]' ],
    pubDate: [ 'Tue, 30 Jun 2015 03:50:01 +0000' ],
    description: [ 'Whether you&#8217;re channeling your inner rocker, bride, or Wall Street professional, the way your hair looks can say a lot about your stage of life. Regardless of your style du jour, your finances &#8212; just like your hairstyle &#8212; need... <p><a href="http://blog.turbotax.intuit.com/2015/06/29/what-does-your-hairstyle-say-about-your-life/" class="entry-more-link">Full Story</a></p><img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=19936&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2015/06/26/congrats-you-graduated-now-what-infographic/' ],
    title: [ 'Congrats, You Graduated!  Now What? [Infographic]' ],
    pubDate: [ 'Fri, 26 Jun 2015 16:05:44 +0000' ],
    description: [ 'Getting your diploma is a huge accomplishment. You&#8217;ve spent countless hours studying and preparing to make the grade. With those responsibilities a thing of the past, it is time to think about your post-college life. Top of mind may be... <p><a href="http://blog.turbotax.intuit.com/2015/06/26/congrats-you-graduated-now-what-infographic/" class="entry-more-link">Full Story</a></p><img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=19920&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2015/03/13/an-education-in-student-savings-10-common-tax-deductions-and-savings-for-students/' ],
    title: [ 'An Education in Student Savings – 10 Common Tax Deductions and Savings for Students' ],
    pubDate: [ 'Fri, 13 Mar 2015 22:37:49 +0000' ],
    description: [ 'There never seems to be enough money, especially if you are a college student strapped for funds. It’s no wonder, with the high cost of tuition and books and housing and dwindling funds available from scholarships, grants and loans. But... <p><a href="http://blog.turbotax.intuit.com/2015/03/13/an-education-in-student-savings-10-common-tax-deductions-and-savings-for-students/" class="entry-more-link">Full Story</a></p><img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=19268&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2014/12/22/is-this-tax-deductible-student-loans/' ],
    title: [ 'Is This Tax Deductible? Student Loans' ],
    pubDate: [ 'Mon, 22 Dec 2014 17:26:42 +0000' ],
    description: [ 'Congratulations, recent college graduates! You’ve finished your last final exam and will finally sleep late during the holidays. The job search—or perhaps grad school—can wait until January. Unfortunately, not far behind is the repayment of any student loans you took... <p><a href="http://blog.turbotax.intuit.com/2014/12/22/is-this-tax-deductible-student-loans/" class="entry-more-link">Full Story</a></p><img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=18532&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2014/08/26/back-to-school-savings-how-to-save-money-on-school-supplies/' ],
    title: [ 'Back-to-School Savings :  How to Save Money on School Supplies' ],
    pubDate: [ 'Tue, 26 Aug 2014 17:58:31 +0000' ],
    description: [ 'If your family is getting ready, here are some ways you can stock up without losing your wallet this month.\r\n<img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=17728&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2014/08/22/back-to-school-savings-tax-tips-for-parents-and-students/' ],
    title: [ 'Back-to-School Savings:  Tax Tips for Parents and Students' ],
    pubDate: [ 'Fri, 22 Aug 2014 23:41:48 +0000' ],
    description: [ 'With college costing more every year, families are looking for ways to manage their finances. While I covered some great tax credits and deductions for parents, I want to focus on school related tax breaks.<img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=17792&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2014/08/19/back-to-school-savings-five-tax-tips-for-teachers/' ],
    title: [ 'Back-to-School Savings:  Five Tax Tips for Teachers' ],
    pubDate: [ 'Tue, 19 Aug 2014 18:28:30 +0000' ],
    description: [ 'If you are a teacher, you have a lot of planning to do for the upcoming year, but with the end of the calendar year fast approaching, you should also be planning for your tax deductions. Here are five tips to save you money on your taxes.<img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=17795&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2014/05/02/6-tax-and-financial-tips-for-college-grads/' ],
    title: [ '6 Tax and Financial Tips for College Grads' ],
    pubDate: [ 'Fri, 02 May 2014 23:02:26 +0000' ],
    description: [ 'Congratulations, class of 2014! Here are 6 tax and financial tips to keep you headed in the right direction as you move into this next phase of life.<img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=16998&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2014/03/05/how-college-students-and-parents-can-save-money/' ],

    title: [ 'How College Students and Parents Can Save Money' ],
    pubDate: [ 'Wed, 05 Mar 2014 16:57:16 +0000' ],
    description: [ 'For many high school seniors and their families, this time of year is busy with college applications sent and replies being eagerly awaited. It also marks FAFSA season as families are filling them out in hopes of getting financial aid. With... <p><a href="http://blog.turbotax.intuit.com/2014/03/05/how-college-students-and-parents-can-save-money/" class="entry-more-link">Full Story</a></p><img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=16288&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2014/03/04/6-common-fafsa-mistakes-infographic/' ],
    title: [ '6 Common FAFSA Mistakes [Infographic]' ],
    pubDate: [ 'Wed, 05 Mar 2014 07:30:35 +0000' ],
    description: [ 'It may seem like you have plenty of time to file your FAFSA, but students can miss out on a lot of potential aid if they don&#8217;t file soon. One of the biggest mistakes can be procrastinating on your taxes... <p><a href="http://blog.turbotax.intuit.com/2014/03/04/6-common-fafsa-mistakes-infographic/" class="entry-more-link">Full Story</a></p><img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=16451&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2014/02/21/turbotax-education-credits-and-deductions-calculator/' ],
    title: [ 'TurboTax Education Credits and Deductions Calculator' ],
    pubDate: [ 'Fri, 21 Feb 2014 22:09:02 +0000' ],
    description: [ 'With the cost of education on the rise, you&#8217;ll be glad to know that education credits and deductions may help offset some of that cost. Whether you&#8217;re a student or parent of a student, with this calculator, you&#8217;ll be able... <p><a href="http://blog.turbotax.intuit.com/2014/02/21/turbotax-education-credits-and-deductions-calculator/" class="entry-more-link">Full Story</a></p><img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=16375&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2014/02/19/education-tax-deductions-and-credits-to-maximize-your-tax-refund/' ],
    title: [ 'Education Tax Deductions and Credits to Maximize Your Tax Refund' ],
    pubDate: [ 'Wed, 19 Feb 2014 19:44:57 +0000' ],
    description: [ 'The cost of education keeps going up, with no end in sight.  If you are caught in that vortex, you\'ll be happy to know that there are education tax deductions and credits that can help offset the costs of education.<img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=16265&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2013/09/04/back-to-school-education-tax-credits-and-deductions-help-you-save-at-tax-time/' ],
    title: [ 'Back to School: Education Tax Credits and Deductions Help You Save at Tax-Time' ],
    pubDate: [ 'Wed, 04 Sep 2013 18:15:21 +0000' ],
    description: [ 'To combat the ever increasing price of college education, the tax code provides some relief via education tax credits and deductions.  Here\'s what you need to know about the education tax credits and deductions that will save you money at tax-time.<img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=12773&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2013/08/28/four-tax-tips-for-college-grads/' ],
    title: [ 'Four Tax Tips for College Grads' ],
    pubDate: [ 'Wed, 28 Aug 2013 19:41:21 +0000' ],
    description: [ 'Congratulations on graduating college! Now that you’re done with school and ready to embark on life in the “real” world, it’s a good idea to get a handle on your tax situation.  Here are 4 things you need to know about taxes as a college grad.<img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=15074&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2013/08/21/student-loan-interest-reductions-and-tax-deductions/' ],
    title: [ 'Student Loan Interest Reductions and Tax Deductions' ],
    pubDate: [ 'Thu, 22 Aug 2013 00:22:18 +0000' ],
    description: [ 'Student loan interest increased dramatically on July 1, however President Obama signed the Student Loan Certainty Act of 2013, which will roll back student loan interest rates to the lower interest rates charged prior to July 1st.  The recent signing of the Student Loan Certainty Act of 2013 will help save millions of students (and parents) money, but how do you save money on student loan interest at tax time?\r\n\r\n<img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=15096&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2013/07/02/3-tips-on-how-much-to-save-for-your-kids-college-fund/' ],
    title: [ '3 Tips on How Much to Save for Your Kids College Fund' ],
    pubDate: [ 'Tue, 02 Jul 2013 21:54:58 +0000' ],
    description: [ 'Whether to pay or not pay for college is a much debated subject. As a parent you have to weigh what\'s best for you and your family. For those looking at getting started with the child\'s college fund, here are 3 tips on how to save money for the future and possibly save money on your contributions.<img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=14776&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: [ 'http://blog.turbotax.intuit.com/2013/03/31/college-tax-breaks-to-take-before-the-tax-deadline/' ],
    title: [ 'College Tax Breaks to Take Before the Tax Deadline' ],
    pubDate: [ 'Mon, 01 Apr 2013 06:43:25 +0000' ],
    description: [ 'There are several advantages of going to college. One of the more immediate financial benefits actually involves your taxes. Did you know that there are plenty of tax credits and deductions that can help you lower your taxable income?  I want to share some of the biggest ones available right now when you prepare your taxes before the tax deadline.<img alt="" border="0" src="http://pixel.wp.com/b.gif?host=blog.turbotax.intuit.com&#038;blog=26340285&#038;post=12971&#038;subd=intuitturbotax&#038;ref=&#038;feed=1" width="1" height="1" />' ] },
  { url: 'www.youtube.com/watch?v=RfgH-FGVvmM',
    thumbnail: 'https://img.youtube.com/vi/RfgH-FGVvmM/0.jpg' },
  { url: 'www.youtube.com/watch?v=t9_4N5awu2c',
    thumbnail: 'https://img.youtube.com/vi/t9_4N5awu2c/0.jpg' },
  { url: 'www.youtube.com/watch?v=VJSymxMvPGU',
    thumbnail: 'https://img.youtube.com/vi/VJSymxMvPGU/0.jpg' },
  { url: 'www.youtube.com/watch?v=uVj6MWESN1A',
    thumbnail: 'https://img.youtube.com/vi/uVj6MWESN1A/0.jpg' },
  { url: 'www.youtube.com/watch?v=JIq8txwQJlo',
    thumbnail: 'https://img.youtube.com/vi/JIq8txwQJlo/0.jpg' } ];
	response.send(x);
});

/*
 * Routes end
 */

/**
 * Setup server
 */
var server = app.listen(3000, function () {
  console.log('Starting eCommIt! ');
});