//START

var socialVp,
	fbJscrollApi,
	twJscrollApi;

//resize end event
$(window).resize(function() {
	if(this.resizeTO) clearTimeout(this.resizeTO);
	this.resizeTO = setTimeout(function() {
		$(this).trigger('resizeEnd');
	}, 500);
});


//deeplink to section based off of query string
function deepLinkToSection() {
	var section,
		deepLinkAnchor;

	section = utils.getParameterByName('section');

	if(section) {		
		switch(section)  {
			case 'votenow':
				deepLinkAnchor = '#vote-now-widget'
			break;

			case 'top5':
				deepLinkAnchor = '#top-five-widget';
			break;

			case 'facts':
				deepLinkAnchor = '#facts-widget';
			break;

			default:
			break;
		}

		//go to section
		$(window).scrollTop($(deepLinkAnchor).offset().top);
	}

}

//ie8 polyfill for nth-child(odd)
function addOddClassToLi(el) {
	var ul = (typeof(el) == 'object') ? el : $('#' + el);

	if(sonyPicturesPortal.isIe()) {
		ul.find('li:nth-child(2n+2)').addClass('odd');
	}
}

var utils = {
		"getParameterByName" : function (name) {
		    var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
		    return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
		},
		"timeAgo": function(dateString) {
			var rightNow = new Date();
	        var then = new Date(dateString);
	         
	        if ($.browser.msie) {
	            // IE can't parse these crazy Ruby dates
	            then = Date.parse(dateString.replace(/( \+)/, ' UTC$1'));
	        }
	 
	        var diff = rightNow - then;
	 
	        var second = 1000,
	        minute = second * 60,
	        hour = minute * 60,
	        day = hour * 24,
	        week = day * 7;
	 
	        if (isNaN(diff) || diff < 0) {
	            return ""; // return blank string if unknown
	        }
	 
	        if (diff < second * 2) {
	            // within 2 seconds
	            return "right now";
	        }
	 
	        if (diff < minute) {
	            return Math.floor(diff / second) + " seconds ago";
	        }
	 
	        if (diff < minute * 2) {
	            return "about 1 minute ago";
	        }
	 
	        if (diff < hour) {
	            return Math.floor(diff / minute) + " minutes ago";
	        }
	 
	        if (diff < hour * 2) {
	            return "about 1 hour ago";
	        }
	 
	        if (diff < day) {
	            return  Math.floor(diff / hour) + " hours ago";
	        }
	 
	        if (diff > day && diff < day * 2) {
	            return "yesterday";
	        }
	 
	        if (diff < day * 365) {
	            return Math.floor(diff / day) + " days ago";
	        }
	 
	        else {
	            return "over a year ago";
	        }
		},
		"ify" : {
			link: function(tweet) {
				return tweet.replace(/\b(((https*\:\/\/)|www\.)[^\"\']+?)(([!?,.\)]+)?(\s|$))/g, function(link, m1, m2, m3, m4) {
				  var http = m2.match(/w/) ? 'http://' : '';
				  return '<a class="twtr-hyperlink" target="_blank" href="' + http + m1 + '">' + ((m1.length > 25) ? m1.substr(0, 24) + ' ...' : m1) + '</a>' + m4;
				});
			},

			at: function(tweet) {
				return tweet.replace(/\B[@@]([a-zA-Z0-9_]{1,20})/g, function(m, username) {
				  return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/intent/user?screen_name=' + username + '">@' + username + '</a>';
				});
			},

			list: function(tweet) {
				return tweet.replace(/\B[@@]([a-zA-Z0-9_]{1,20}\/\w+)/g, function(m, userlist) {
				  return '<a target="_blank" class="twtr-atreply" href="http://twitter.com/' + userlist + '">@' + userlist + '</a>';
				});
			},

			hash: function(tweet) {
				return tweet.replace(/(^|\s+)#(\w+)/gi, function(m, before, hash) {
				  return before + '<a target="_blank" class="twtr-hashtag" href="http://twitter.com/search?q=%23' + hash + '">#' + hash + '</a>';
				});
			},

			clean: function(tweet) {
				return this.hash(this.at(this.list(this.link(tweet))));
			}
		}
	}           


var screenshotsCarousel = function(el,options) {

	var $screenshotsCarouselContainer = (typeof(el) == 'object') ? el : $('#' + el),
		$screenshotsCarouselUl = $screenshotsCarouselContainer.children('ul'),
		$screenshotsCarouselLi = $screenshotsCarouselUl.children('li'),
		screenshotsCarouselCount = $screenshotsCarouselLi.length,
		screenshotsCarouselWidth = 0,
		screenshotsCarouselIscroll = null,
		_this = this;

	//defaults
	_this.options = {
		"navidots" : true
	}

	// User defined options
	for (i in options){
		_this.options[i] = options[i];
	} 

	function initCarousel() {
		$screenshotsCarouselContainer.each(function(i){		
			//calculate width of ul based on width of li
			$screenshotsCarouselLi.each(function(i){
				screenshotsCarouselWidth += $(this).outerWidth(true);
			});
			
			$screenshotsCarouselUl.css({
				'width': screenshotsCarouselWidth + 'px'
			});		
		});
		
		//add pagination
		if(screenshotsCarouselCount > 1) {
			createPagination(screenshotsCarouselCount);
		}
		if(sonyPicturesPortal.isIe() == false) {			
			switch(sonyPicturesPortal.responsiveLayout()) {
				case 'desktop':
				break;
				
				case 'tablet_landscape':
					if(sonyPicturesPortal.hasTouch) {
						mobileInit();
					}
				break;
				
				case 'tablet_portrait':
					if(sonyPicturesPortal.hasTouch) {
						mobileInit();
					}
				break;
				
				case 'mobile_landscape':		
					mobileInit();
				break;
				
				case 'mobile_portrait':
					mobileInit();
				break;
			}
		}
	}
	
	function mobileInit() {
		var $screenshotLi = $screenshotsCarouselContainer.find('.screenshots > li'),
			$paginationLi = $screenshotsCarouselContainer.find('.pagination-container > .pagination > li');	
			
		//init iscroll
		if(screenshotsCarouselIscroll == null) {
			screenshotsCarouselIscroll = new iScroll($screenshotsCarouselContainer.get(0),{
				bounce: true,
				hScrollbar: false,
				momentum: false,
				snap: true,
				vScroll: false,
				onBeforeScrollStart: function (e) {
					if('ontouchstart' in document.documentElement) {
						point = e.touches[0];
						pointStartX = point.pageX;
						pointStartY = point.pageY;
						null;
					} else {
						e.preventDefault();
					}
				},
				onBeforeScrollMove: function(e){
					if('ontouchstart' in document.documentElement) {
						point = e.touches[0];
						deltaX = Math.abs(point.pageX - pointStartX);
						deltaY = Math.abs(point.pageY - pointStartY);
						if (deltaX >= deltaY) {
								e.preventDefault();
						} else {
								null;
							}
					}					
				},
				onScrollMove: function(e) {
					var $previous = $screenshotsCarouselContainer.find('.pagination-container > .pagination-previous'),
						$next = $screenshotsCarouselContainer.find('.pagination-container > .pagination-next');
						
					//reset arrows
					$previous.removeClass('disabled');
					$next.removeClass('disabled');
				},
				onScrollEnd: function(e) {
					var currentIndex = this.currPageX,
						$previous = $screenshotsCarouselContainer.find('.pagination-container > .pagination-previous'),
						$next = $screenshotsCarouselContainer.find('.pagination-container > .pagination-next'),
						previousIndex,
						nextIndex,
						linkRel;

					//reset pagination
					$screenshotLi.removeClass('active');
					$paginationLi.removeClass('active');						
					
					//set active page
					$screenshotLi.eq(currentIndex).addClass('active');
					$paginationLi.eq(currentIndex).addClass('active');
					
					//update arrows
					//previous
					previousIndex = parseInt(currentIndex) - 1;
					previousIndex = (previousIndex < 0) ? 0 : previousIndex;
					$previous.attr({'rel' : previousIndex});
					
					//beginning of carousel
					if(currentIndex == 0) {
						$previous.addClass('disabled');
					}

					//next
					nextIndex = parseInt(currentIndex) + 1;
					nextIndex = (nextIndex > (screenshotsCarouselCount - 1)) ? (screenshotsCarouselCount - 1) : nextIndex;
					$next.attr({'rel' : nextIndex});

					//end of carousel
					if(currentIndex == parseInt(screenshotsCarouselCount - 1)) {
						$next.addClass('disabled');
					}

					if(_this.options.executeAfterScroll) {
						_this.options.executeAfterScroll();
					}
				}
			});
		}
	}
	
	function mobileGoToScreenshot(screenshotIndex) {
		if(screenshotsCarouselIscroll != null) {
			var $previous = $screenshotsCarouselContainer.find('.pagination-container > .pagination-previous'),
				$next = $screenshotsCarouselContainer.find('.pagination-container > .pagination-next');
				
			//reset arrows
			$previous.removeClass('disabled');
			$next.removeClass('disabled');
			
			//go to screenshot	
			screenshotsCarouselIscroll.scrollToPage(screenshotIndex,0,200);
		}
	}
	
	function createPagination(billboardsCount) {
		//create pagination
		$paginationContainer = $(document.createElement('div')).attr('class','pagination-container').appendTo($screenshotsCarouselUl.parent());

		if(_this.options.navidots) {
		
			$pagination = $(document.createElement('ul')).attr({'class': 'pagination'});
			
			for(var k = 0; k < billboardsCount; k++) {
				var counter = k + 1,
					$paginationLI = $(document.createElement('li')).attr({
						'class': 'screenshots-nav',
						'rel': k
					}).text(k).appendTo($pagination);
					
				if(k == 0) {
					$paginationLI.addClass('active');
				}
			}

			$pagination.appendTo($paginationContainer);
		}
		
		$previous = $(document.createElement('div')).attr({
			'class': 'pagination-previous screenshots-nav sprite disabled',
			'rel': 0
		}).text('Previous Billboard').prependTo($paginationContainer);
		
		$next = $(document.createElement('div')).attr({
			'class': 'pagination-next screenshots-nav sprite',
			'rel': 1
		}).text('Next Billboard').appendTo($paginationContainer);
		
		$screenshotsCarouselContainer.find('.screenshots-nav').bind('click',function(e){
			if(!$(this).hasClass('disabled')){
				if(screenshotsCarouselIscroll == null) {
					//desktop
					goToScreenshot($(this).attr('rel'));
				} else {
					//tablet and mobile
					mobileGoToScreenshot($(this).attr('rel'));
				}
			}
			e.preventDefault();
		});
	}
	
	function goToScreenshot(screenshotIndex) {
		var	liWidth = $screenshotsCarouselLi.eq(0).outerWidth(true),
			$previous = $screenshotsCarouselContainer.find('.pagination-container > .pagination-previous'),
			$next = $screenshotsCarouselContainer.find('.pagination-container > .pagination-next'),
			animationDuration = 500,
			carouselOffset,
			previousIndex,
			nextIndex;
			
		//reset
		$previous.removeClass('disabled');
		$next.removeClass('disabled');

		//move carousel
		carouselOffset = liWidth * screenshotIndex;
		$screenshotsCarouselUl.animate({
			'right': carouselOffset				
		},{
			'duration': animationDuration,
			'queue': false,
				'complete': function(){
				var $screenshotLi = $screenshotsCarouselContainer.find('.screenshots > li'),
					$paginationLi = $screenshotsCarouselContainer.find('.pagination-container > .pagination > li');
				
				//update active screenshot
				$screenshotLi.removeClass('active');		
				$screenshotLi.eq(screenshotIndex).addClass('active');

				//update pagination
				$paginationLi.removeClass('active');		
				$paginationLi.eq(screenshotIndex).addClass('active');

				//update arrows
				//previous
				previousIndex = parseInt(screenshotIndex) - 1;
				previousIndex = (previousIndex < 0) ? 0 : previousIndex;
				$previous.attr({'rel' : previousIndex});
				
				//beginning of carousel
				if(screenshotIndex == 0) {
					$previous.addClass('disabled');
				}

				//next
				nextIndex = parseInt(screenshotIndex) + 1;
				nextIndex = (nextIndex > (screenshotsCarouselCount - 1)) ? (screenshotsCarouselCount - 1) : nextIndex;
				$next.attr({'rel' : nextIndex});

				//end of carousel
				if(screenshotIndex == parseInt(screenshotsCarouselCount - 1)) {
					$next.addClass('disabled');
				}

				if(_this.options.executeAfterScroll) {
					_this.options.executeAfterScroll();
				}

			}
		});

	}
	
	this.init = function() {
		initCarousel();
	}
}

var SocialContentStage = function() {
	var _this = this,
		socialVp,
		playerAttr = {
			"dimensions" : {
				"desktop": {
					"width": 640,
					"height": 390
				},
				"tablet_landscape" : {
					"width": 640,
					"height": 390
				},
				"tablet_portrait" : {
					"width": 505,
					"height": 308
				},
				"mobile_landscape" : {
					"width": 310,
					"height": 220
				},
				"mobile_portrait" : {
					"width": 310,
					"height": 220
				}
			}
		};

	function reinit() {
		//kill player
		socialVp.destroy();

		//reinit
		initVp();
	}

	function initVp() {
		var rLayout;

		if(sonyPicturesPortal.isIe()) {
			rLayout = 'desktop';
		} else if(sonyPicturesPortal.responsiveLayout() == 'tablet_portrait' && $(window).width() > 1000 && !sonyPicturesPortal.hasTouch) {
			//1024 resolution hack
			rLayout = 'tablet_landscape';
		} else {
			rLayout = sonyPicturesPortal.responsiveLayout();
		}

		socialVp = new portalVideoPlayer({ 'inlineContainer': 'social-video-player-container','mobileInlineOverride': true, 'playerWidth': playerAttr.dimensions[rLayout].width, 'playerHeight': playerAttr.dimensions[rLayout].height, 'isAutoplay': true});

		setTimeout(function(e){
			socialVp.createVideoPlayer($('#social-content-stage-video-url').attr('href'));
		},500);
	}

	function init() {
		var reinitEvent;
		initVp();

		if(sonyPicturesPortal.isIe() == false) {
			//use resize event for tablet to prevent browser crash
			reinitEvent = (sonyPicturesPortal.hasTouch) ? 'resize' : 'resizeEnd';

			$(window).bind(reinitEvent,function(e){
				reinit();				
			});
		}
	}

	init();
}

var FacebookWidget = function() {
	var fbScrollWidgetTracking = false;

	function getFbPosts() {
		var feedUrl;

		feedUrl = 'https://www.facebook.com/feeds/page.php?format=rss20&id=7695091930'

		$.ajax({
			url: '//ajax.googleapis.com/ajax/services/feed/load?v=1.0&num=10&callback=?&q='+ encodeURIComponent(feedUrl),
			type: 'GET',
			async: false,
			dataType: "json",
			success: function(data) {
				var $spFbfeed,
					$spFbfeedLi,
					$spFbfeedText,
					$spFbfeedReadMore,
					$spFbfeedTimeAgo,
					i,
					resultsLength = data.responseData.feed.entries.length;

				$spFbfeed = $(document.createElement('ul')).attr({'id': 'sp-facebook-feed'}).appendTo('#facebook-widget-feed-container');

				for(i=0;i<resultsLength;i++) {
					$spFbfeedLi = $(document.createElement('li')).appendTo($spFbfeed);

					$spFbfeedText = $(document.createElement('p')).addClass('sp-facebook-feed-text').html(data.responseData.feed.entries[i].contentSnippet).appendTo($spFbfeedLi);

					$spFbfeedReadMore = $(document.createElement('a')).addClass('sp-facebook-feed-read-more').attr({
							'href': data.responseData.feed.entries[i].link,
							'target': '_blank'
						}).text('Read more').appendTo($spFbfeedLi);

					$spFbfeedTimeAgo = $(document.createElement('p')).addClass('sp-facebook-feed-timeago').text(utils.timeAgo(data.responseData.feed.entries[i].publishedDate)).appendTo($spFbfeedLi);
				}

				toggleFeeds();

				//init jscrollpane
				initJsp();
			}
		});
	}

	function toggleFeeds() {
		if(sonyPicturesPortal.hasTouch == false  && /mobile/.test(sonyPicturesPortal.responsiveLayout()) == false && sonyPicturesPortal.isIe() == false) {
			$('#sp-facebook-feed').hide();
			$('#facebook-widget-feed').show();
		} else {
			$('#facebook-widget-feed').hide();
			$('#sp-facebook-feed').show();
		}
	}

	function initJsp() {
		var jspEle,
			jspInterval;

		jspEle = $('#facebook-widget-feed-container').jScrollPane({
			verticalDragMinHeight: 20,
			verticalDragMaxHeight: 60
		});
		fbJscrollApi = jspEle.data('jsp');

		jspEle.bind('jsp-scroll-y',function(event, scrollPositionY, isAtTop, isAtBottom) {
			var scrollTrackingThreshold = 200;

			if (scrollPositionY > scrollTrackingThreshold && fbScrollWidgetTracking == false && typeof(sCode) == 'object') {
				fbScrollWidgetTracking = true;

				sCode.trackOutboundClick('facebookscroll.html','facebookscroll_button');
			}

		});

		//reinit jscrollpanes indefinitely since we don't know when the iframes finish loading
		jspInterval = window.setInterval(function(e){
			fbJscrollApi.reinitialise();
		}, 3000);

		if(sonyPicturesPortal.isIe() == false) {	
			$(window).bind('resizeEnd',function(e){
				toggleFeeds();
				fbJscrollApi.reinitialise();
			});
		}
	}

	function init() {
		getFbPosts();
	}

	init();
}

// TWITTER FEED

var TwitterWidget = function() {
	var _this = this,
	
	function getTweets() {
		var getTweetsUrl;

		getTweetsUrl = (isDev) ? 'scripts/tweets.json' : '/spotlight/data/twitter/feed/jsonfile';

		console.log(getTweetsUrl);

		$.ajax({
			url: getTweetsUrl,
			type: 'GET',
			dataType: "json",
			error: function(data) {
				console.log(data);
			},
			success: function(data) {
				var $tweetUL,
					$tweetLi,
					$tweetHeader,
					$profileImageLink,
					$profileImage,
					$usernameContainer,
					$displayname,
					$username,
					$createdAt,
					$tweetBody,
					tweetScrollPane,
					api,
					i,
					resultsLength = data.results.length;

				$tweetUL = $(document.createElement('ul')).attr({'id': 'twitter-widget-feed'}).appendTo('#twitter-widget-feed-container');

				for (i=0;i<resultsLength;i++) {		
					$tweetLi = $(document.createElement('li')).appendTo($tweetUL);
					$tweetHeader = $(document.createElement('div')).addClass('tweet-header').appendTo($tweetLi);

					//profile image
					$profileImageLink = $(document.createElement('a')).attr({
						"href": "https://twitter.com/" + data.results[i].from_user,
						"target": "_blank"
					}).appendTo($tweetHeader);
					$profileImage = $(document.createElement('img')).attr({
						"src": data.results[i].profile_image,
						"alt": data.results[i].from_user_name
					}).addClass('profile-image').appendTo($profileImageLink);

					//username
					$usernameContainer = $(document.createElement('div')).addClass('username-container').appendTo($tweetHeader);
					$displayname = $(document.createElement('a')).attr({
						"href": "https://twitter.com/" + data.results[i].from_user,
						"target": "_blank"
					}).addClass('displayname').text(data.results[i].from_user_name).appendTo($usernameContainer);
					$username = $(document.createElement('a')).attr({
						"href": "https://twitter.com/" + data.results[i].from_user,
						"target": "_blank"
					}).addClass('username').text('@' + data.results[i].from_user).appendTo($usernameContainer);

					//created at
					$createdAt = $(document.createElement('p')).addClass('created-at').text(utils.timeAgo(data.results[i].created_at)).appendTo($tweetHeader);

					//tweet
					$tweetBody = $(document.createElement('p')).addClass('tweet-body').html(utils.ify.link(data.results[i].text)).appendTo($tweetLi);

					//tracking
					if(typeof(sCode) == 'object'){
						$profileImageLink.bind('click',function(e){
							sCode.trackOutboundClick($(this).attr('href'), 'followtwitter_image');
						});

						$displayname.bind('click',function(e){
							sCode.trackOutboundClick($(this).attr('href'), 'followtwitter_text');
						});

						$username.bind('click',function(e){
							sCode.trackOutboundClick($(this).attr('href'), 'followtwitter_text');
						});
					}
				}

				//init scrollpane
				tweetScrollPane = $tweetUL.parent().jScrollPane({
					verticalDragMinHeight: 20,
					verticalDragMaxHeight: 60
				});

				twJscrollApi = tweetScrollPane.data('jsp');

				//reinit on window resize
				$(window).bind('resizeEnd',function(e){
					twJscrollApi.reinitialise();
				});
			}
		});
	}

	function init(e) {
		getTweets();
	}

	init();
}


var InstagramWidget = function() {
	function addLeadingZero(num) {
		var output;

		if(parseInt(num) < 10) {
			output = '0' + num;
		} else {
			output = num;
		}

		return output
	}

	function createInstagramIframes() {

		$('#instagram-widget-feed li').each(function(i){
			var postId,
				$instagramIframe;

			//get post id
			postId = $(this).find('.instagram-post-id').text();

			//empty list item
			$(this).empty();

			//create instagram iframe
			$instagramIframe = $(document.createElement('iframe')).attr({
				'src': '//instagram.com/p/' + postId + '/embed/',
				'width': 290,
				'height': 436,
				'frameborder': 0,
				'scrolling': 'no',
				'allwotransparency': 'true'
			}).appendTo($(this));
		});
	}

	function createPaginationCounter(e) {
		var $paginationCount,
			instagramCount,
			leadingZero,
			$paginationCountText;

		$paginationCount = $(document.createElement('div')).addClass('pagination-count').appendTo('#instagram-widget-feed-container');

		instagramCount = $('#instagram-widget-feed li').length;

		$paginationCountText = $('<span class="current">01</span> of <span class="total">' + addLeadingZero(instagramCount) + '</span>').appendTo($paginationCount);

	}

	function updatePaginationCounter(e) {
		var activeIndex,
			count,
			$currentCount;

		activeIndex = $('#instagram-widget-feed .active').index();
		count = parseInt(activeIndex) + 1;

		$currentCount = $('#instagram-widget-feed-container .pagination-count .current').text(addLeadingZero(count));

		//tracking
		if(typeof(sCode) == 'object') {
			sCode.trackOutboundClick('instagramgallery.html','instagramgallery' + count +'_button');
		}

	}

	function executeAfterScroll(e) {
		updatePaginationCounter();
	}

	function init(e){
		var newScreenshotsCarousel;

		if(sonyPicturesPortal.isIe() == false) {
			createInstagramIframes();
			createPaginationCounter();

			newScreenshotsCarousel = new screenshotsCarousel($('#instagram-widget-feed-container'),{'navidots': false, 'executeAfterScroll': executeAfterScroll});
			newScreenshotsCarousel.init();
		} else {
			$('#instagram-follow-promo-placeholder').show();
		}		
	}

	init();
}


var PollWidget = function(pid,options) {
	var _this = this,
		propertyId = pid,
		isDev = (/sonypictures.com/.test(window.location.hostname)) ? false : true;

	_this.options = new Object();

	// User defined options
	for (i in options){
		_this.options[i] = options[i];
	}

	function createPoll() {
		var getPollUrl;

		getPollUrl = (isDev) ? 'scripts/post.json' : '/spotlight/poll/api/get_poll.php';

		$.ajax({
			url: getPollUrl,
			data: {'id': propertyId},
			type: 'GET',
			dataType: "json",
			success: function(data) {
				var $pollContent,
					$pollHeader,
					$pollImageLink,
					$pollImage,
					$pollQuestion,
					$voteForm,
					$pidField,
					$choicesUl,
					$voteButton;

				//poll header
				$pollHeader = $(document.createElement('div')).attr({'id': 'poll-header'}).insertAfter('#poll-id');
				$pollImageLink = $(document.createElement('a')).attr({'href': data.url}).appendTo($pollHeader);
				$pollImage = $(document.createElement('img')).attr({'src': data.image, 'alt': data.question}).appendTo($pollHeader);
				$pollQuestion = $(document.createElement('h4')).attr({'id': 'poll-question'}).html(data.question).appendTo($pollHeader);

				//poll questions
				$pollContent = $(document.createElement('div')).attr({'id': 'poll-content'}).appendTo('#poll-content-container');
				$voteForm = $(document.createElement('form')).attr({'id': 'vote-form'}).appendTo($pollContent);
				$pidField = $(document.createElement('input')).attr({
					'id': 'pid',
					'name': 'pid',
					'type': 'hidden',
					'value': propertyId
				}).appendTo($voteForm);

				$choicesUl = $(document.createElement('ul')).addClass('striped').appendTo($voteForm);
				for(i in data.answers) {
					$('<li><label><input type="radio" value="' + i + '" name="answer">' + data.answers[i].answer + '</label></li>').appendTo($choicesUl);
				}

				//ie8 striping
				addOddClassToLi($choicesUl);

				$voteButton = $('<button type="submit">Vote</button>').appendTo($voteForm);

				$voteButton.bind('click',function(e){
					e.preventDefault();
					e.stopPropagation();

					vote($voteForm);
				});
			}
		});
	}

	function vote(el) {
		var $form = (typeof(el) == 'object') ? el : $('#' + el),
			answerVal;

		//check if selection has been made
		answerVal = $form.find('input[name="answer"]:checked').val();

		if(answerVal) {
			postVote($form,answerVal);
		} else {
			alert('Please select your choice before voting.');
		}
	}

	function postVote(el,val) {
		var $form = (typeof(el) == 'object') ? el : $('#' + el),
			postUrl;

		postUrl = (isDev) ? 'scripts/results.json' : '/spotlight/poll/api/save_poll.php';

		//tracking
		if(typeof(sCode) == 'object') {
			sCode.trackOutboundClick('vote.html','vote_button');
		}

		$.ajax({
			url: postUrl,
			data: {'answer': val, 'id': propertyId},
			type: 'POST',
			dataType: "json",
			success: function(data) {
				var $resultsUl,
					$resultsLi;

				//create results set
				$resultsUl = $(document.createElement('ul')).attr({'id': 'poll-results'}).addClass('striped').appendTo('#poll-content').hide();
				for(i in data.answers) {
					$resultsLi = $('<li><a href="' + data.answers[i].url + '"><p class="answer">' + data.answers[i].answer + '</p><p class="percentage"><span>' + data.answers[i].percent + '%</span></p></a></li>').appendTo($resultsUl);

					$resultsLi.find('span').css({'width': data.answers[i].percent + '%'});
				}

				//ie8 striping
				addOddClassToLi($resultsUl);

				$form.fadeOut('fast',function(){
					$(this).empty().remove();

					$resultsUl.fadeIn('fast');
				});
			}
		});
	}

	function init() {
		createPoll();
	}

	init();
}

var FactsWidget = function() {
	var $factoids;

	//get factoids
	$factoids = $('#facts-widget-content .factoid');

	function createFactDetails(e) {
		var $factDetailContainer,			
			$title,
			$factCount,
			$factBody,
			titleText,
			factoidText,

		//create container
		$factDetailContainer = $(document.createElement('div')).attr({'id': 'fact-detail-container'}).appendTo('#facts-widget-content');

		//create title
		titleText = $('#facts-widget-title').text();
		$title = $(document.createElement('h4')).text(titleText).appendTo($factDetailContainer);

		//create count
		$factCount = $('<div id="fact-count"><p>Fact <em>#</em> <span>1</span></p></div>').appendTo($factDetailContainer);

		//create fact body, set text to first item
		factoidText = $(document.createElement('p')).attr({'id': 'fact-body'}).html($factoids.eq(0).html()).appendTo($factDetailContainer);

	}

	function updateFactInfo(e) {
		var	activeIndex,
			$factCount,
			count,
			$factBody;

		activeIndex = $('#facts-widget-content .active').index();
		count = parseInt(activeIndex) + 1;

		//update count
		$('#fact-count span').empty();
		$('#fact-count span').text(count);

		//update fact text
		$('#fact-body').html($factoids.eq(activeIndex).html());

		//tracking
		if(typeof(sCode) == 'object') {
			sCode.trackOutboundClick('fact.html','fact' + count +'_button');
		}
	}

	function executeAfterScroll(e) {
		updateFactInfo();		
	}

	function init(e) {
		var newScreenshotsCarousel;

		createFactDetails();

		newScreenshotsCarousel = new screenshotsCarousel($('#facts-widget-content .screenshots-container'),{"executeAfterScroll": executeAfterScroll});

		newScreenshotsCarousel.init();
	}	

	init();
}

$(document).ready(function(){
	var jspEle,
		newSocialContentStage = new SocialContentStage(),
		newFacebookWidget = new FacebookWidget(),
		newInstagramWidget = new InstagramWidget(),
		newTwitterWidget = new TwitterWidget(),
		newPollWidget = new PollWidget($('#poll-id').text()),
		newFactsWidget = new FactsWidget();

	deepLinkToSection();

	$('.striped').each(function(i){
		addOddClassToLi($(this));
	});
}); 