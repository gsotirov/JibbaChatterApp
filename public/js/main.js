$(function() {

	var FADE_TIME = 300;

    var socket = io();

	var $window = $(window),
		$log = $('#log'),
    	$eventsLog = $('#eventsLog'),
        $usersList = $('#usersList'),
		$messageInput = $('.message-input'),
		$usernameInput = $('.username-input'),
		$loginPage = $('.page.login'),
		$chatPage = $('.page.chat'),
        $greeting = $('.greeting');

	var user = {},
		connected = false,
		typing = false,
		$cInput = $usernameInput.focus(),
        $userPicHold = $('#p-icons');
    
    // Initializing the global user variable with details about the currently logged in user...
	function setUser() {

        if($usernameInput.val() !== '' && $userPicHold.find('.pic-selected').length !== 0) {

            user['name'] = cleanInput($usernameInput.val().trim());
            user['pic'] = $userPicHold.find('.pic-selected').data('name');

    		if(!isEmpty(user)) {
    			$loginPage.fadeOut(FADE_TIME);
    			setTimeout(function() {
                    $chatPage.fadeIn(FADE_TIME);
                    $greeting.fadeIn(FADE_TIME);

                }, FADE_TIME);
    			//$loginPage.off('click');
    			$cInput = $messageInput.focus();
    		}

            socket.emit('add user', user);
        }
        else {
            $('.loginerr').css('display', 'block').text('Please make sure you have selected a username and pic!');
        }
	}

	function sendMessage() {
		var message = cleanInput($messageInput.val().trim());

		if(message && connected) {
			$messageInput.val('');

			addChatMessage({
				username: user.name,
                isMe: true,
				pic: user['pic'],
				message: message
			});

			socket.emit('new message', message, {
                username: user.name, 
                pic: user['pic']
            });
		}
	}

	function addChatMessage(msgData) {
		
        var isMe = (typeof msgData.isMe !== 'undefined' && msgData.isMe === true) ? 'me' : 'others';
		var msgHtml = '<div class="message ' + isMe + ' clearfix">' +
					       '<div class="pic-n-name">' +
					       	   '<div class="u-pic"><img src="images/' + msgData.pic + '"/></div>' +
					       	   '<div class="u-name">' + msgData.username + '</div>' +
					       '</div>' +
			   			   '<div class="text relative">' + msgData.message + '</div>' +
					   '</div>';

		$log.append(msgHtml);
        $log[0].scrollTop = $log[0].scrollHeight;
	}

	// Cleaning the input of any potential markup injection...
    function cleanInput (input) {
        return $('<div/>').text(input).text();
    }

    function onUserJoined(u) {
    	if(connected && u.name !== user.name) {
    		$usersList.append(prepareUserForList(u));
    	}
    }

    function onUserLeft(u) {
    	if(connected) {
            $('.list-item.' + u.name).remove();
        }
    }
    
    function addUsersToList(users) {
        if(!isEmpty(users) && connected) {
            var usersListHtml = '';
            for(var u in users) {
                if(users[u].name !== user.name) {
                    usersListHtml += prepareUserForList(users[u]);
                }
            }
            $usersList.html(usersListHtml);
        }
    }
    
    function prepareUserForList(user) {
        
        var profilePic = (user.pic) ? user.pic : 'default-profile.png';
        var html = '';
        
        html += '<div class="list-item user clearfix ' + user.name + '">';
        html += '<span class="list-u-pic">';
        html += '<img src="images/' + profilePic + '"/>'; 
        html += '</span>';
        html += user.name;
        html += '</div>';
        
        return html;
    }
    
    function isEmpty (obj) {
        return (Object.getOwnPropertyNames(obj).length === 0);
    }

    // Keyboard events

    $window.keydown(function (event) {
        // Auto-focus the current input when a key is typed
        if (!(event.ctrlKey || event.metaKey || event.altKey)) {
          $cInput.focus();
        }
        // When the client hits ENTER on their keyboard
        if (event.which === 13) {
            if(!isEmpty(user)) {
                sendMessage();
            } 
            else {
                setUser();
            }
        }
    });

    $messageInput.on('input', function() {
        updateTyping();
    });

    // Handle the user image pick...
    $('.p-i-inner').click(function() {
        $('.p-i-inner.pic-selected').removeClass('pic-selected');
        $(this).addClass('pic-selected');
    });

    $('#login-btn').click(function() {
        setUser();
    });

    // Focus input when clicking on the message input's border
    $messageInput.click(function () {
        $messageInput.focus();
    });

    // Socket events

    socket.on('login', function (data) {
        connected = true;
        addUsersToList(data.usersList);
        $('.greeting').text('Hello, ' + user.name);
    });

    socket.on('new message', function (msg) {
    	addChatMessage(msg);
    });

    socket.on('user joined', function (user) {
    	onUserJoined(user);
    });

    socket.on('user left', function (user) {
        onUserLeft(user);
    });

});