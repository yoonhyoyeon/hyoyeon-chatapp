//firebase
var config = {
  apiKey: "APIKEY:)",
  authDomain: "hyoyeon-chatapp.firebaseapp.com",
  databaseURL: "https://hyoyeon-chatapp.firebaseio.com",
  projectId: "hyoyeon-chatapp",
  storageBucket: "hyoyeon-chatapp.appspot.com",
  messagingSenderId: "518419199394"
};

firebase.initializeApp(config);
var db = firebase.firestore();

users = {}
db.collection("users").orderBy('last').onSnapshot(function(snapshot) {
  snapshot.docChanges().forEach(function(change) {
    if (change.type === "added") {
      users[change.doc.id] = change.doc.data();
    }
    if (change.type === "modified") {
      users[change.doc.id] = change.doc.data();
    }
    if (change.type === "removed") {
      delete users[change.doc.id];
    }
  });
});

/* jQuery */
var target_room=0;
var now_user=0;
var UserRooms;
var listening_message=new Array();
var listen_room;

$(document).ready(function() {


  /* 회원가입 & 로그인  */
  /* 회원가입 & 로그인  */
  /* 회원가입 & 로그인  */
  /* 회원가입 & 로그인  */
  /* 회원가입 & 로그인  */

  /* 인증 */
  $('.firebaseui-idp-button').click(function() {
    $('.signin-popup').addClass('hidden'); //로그인 메뉴 닫음
  })
  /* google */
  /* 버튼을 눌렀을 때 구글인증 동작 */
  $('.firebaseui-idp-google').click(function() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      //인증 성공
      /* 유저 DB생성 */
      db.collection("users").doc(result.user.uid).set({
          name: result.user.displayName,
          email: result.user.email,
          profileimg: result.user.photoURL,
          uid: result.user.uid,
          online: true,
          last: new Date(+ new Date()),
          creationTime: new Date(result.user.metadata.creationTime),
          provider: result.additionalUserInfo.providerId
      }).catch(function(error) { console.error("Error writing document: ", error); });

    }).catch(function(error) {
      //인증 실패
      console.log(error.message);
    });
  });

  /* facebook */
  /* 버튼을 눌렀을 때 페이스북 인증 동작 */
  $('.firebaseui-idp-facebook').click(function() {
    var provider = new firebase.auth.FacebookAuthProvider();
    firebase.auth().signInWithPopup(provider).then(function(result) {
      //인증 성공
      /* 유저 DB생성 */
      db.collection("users").doc(result.user.uid).set({
          name: result.user.displayName,
          email: result.user.email,
          profileimg: result.user.photoURL,
          uid: result.user.uid,
          online: true,
          last: new Date(+ new Date()),
          creationTime: new Date(result.user.metadata.creationTime),
          provider: result.additionalUserInfo.providerId
      }).catch(function(error) { console.error("Error writing document: ", error); });
    }).catch(function(error) {
      //인증 실패
      console.log(error.message);
    });
  });

  /* email and password */
  $('.signin-email input').focus(function() {
    $(this).parents('.firebaseui-textfield').addClass('is-focused');
  })
  $('.signin-email input').blur(function() {
    $(this).parents('.firebaseui-textfield').removeClass('is-focused');
  })
  $('.signin-email input').keyup(function() {
    if($(this).val().length > 0) {
      $(this).parents('.firebaseui-textfield').addClass('is-dirty');
      $(this).parents('.firebaseui-textfield').removeClass('firebaseui-textfield-invalid');
      $(this).parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').addClass('firebaseui-hidden');
    }
    else $(this).parents('.firebaseui-textfield').removeClass('is-dirty');
  })
  $('.signin-email input').change(function() {
    if($(this).val().length > 0) {
      $(this).parents('.firebaseui-textfield').addClass('is-dirty');
      $(this).parents('.firebaseui-textfield').removeClass('firebaseui-textfield-invalid');
      $(this).parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').addClass('firebaseui-hidden');
    }
    else $(this).parents('.firebaseui-textfield').removeClass('is-dirty');
  })
  $('.signin-email #close').click(function() {
    $('.signin-email input').parents('.firebaseui-textfield').removeClass('firebaseui-textfield-invalid');
    $('.signin-email input').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').addClass('firebaseui-hidden');
    $('.signin-email').addClass('hidden');
    $('.signin-email input').val('');
    $('.signin-email input').trigger('change');
  })//창 닫기
  $('.firebaseui-idp-password').click(function() {
    $('.signin-email.check').removeClass('hidden');
    $('.signin-email.check #email').focus();
  })//창 열기

  /*이메일 체크*/
  $('.signin-email.check #next').click(function() {
    //이메일 형식 체크
    var email = $('.signin-email.check #email').val();
    if(email.length == 0) {
      $('.signin-email.check #email').focus();
      $('.signin-email.check #email').parents('.firebaseui-textfield').addClass('firebaseui-textfield-invalid');
      $('.signin-email.check #email').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').text('이메일을 입력해주세요.');
      $('.signin-email.check #email').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').removeClass('firebaseui-hidden');
      return false;
    }
    var exptext = /^[A-Za-z0-9_\.\-]+@[A-Za-z0-9\-]+\.[A-Za-z0-9\-]+/;
    if(exptext.test(email)==false){
      $('.signin-email.check #email').focus();
      $('.signin-email.check #email').parents('.firebaseui-textfield').addClass('firebaseui-textfield-invalid');
      $('.signin-email.check #email').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').text('이메일 형식이 잘못되었습니다.');
      $('.signin-email.check #email').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').removeClass('firebaseui-hidden');
      return false;
    }
    //회원가입 or 로그인
    var flag=1;
    for(hash in users) {
      if(users[hash].email == email) {
        flag=0;
        //페이스북이나 구글로 이미 계쩡생성됨
        if(users[hash].provider != "password") {
          $('.signin-email.check #email').focus();
          $('.signin-email input').val('');// 오류 : 이미 다른 플렛폼으로 계쩡생성함.
          $('.signin-email input').trigger('change');
          $('.signin-email.check #email').parents('.firebaseui-textfield').addClass('firebaseui-textfield-invalid');
          $('.signin-email.check #email').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').text('다른 플랫폼으로 이미 생성된 이메일 입니다.');
          $('.signin-email.check #email').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').removeClass('firebaseui-hidden');
        }
        else { //회원가입됬다면
          $('.signin-email.signin').removeClass('hidden');// 로그인
          $('.signin-email.signin #password').focus();
        }
      }
    }
    if(flag) { //DB에 같은 이메일이 없다면
      $('.signin-email.signup').removeClass('hidden');// 회원가입
      $('.signin-email.signup #name').focus();
    }
  });
  $(".signin-email.check #email").keyup(function(key) { //엔터 submit
    if (key.keyCode == 13) $('.signin-email.check #next').trigger('click');
  });

  /*회원가입*/
  $('.signin-email.signup #next').click(function() {
    var flag=0;
    var signup_mail = $('.signin-email.check #email').val();
    var signup_name = $('.signin-email.signup #name').val();
    var signup_password = $('.signin-email.signup #password').val();
    if(signup_name.length==0) {
      flag=1;
      $('.signin-email.signup #name').parents('.firebaseui-textfield').addClass('firebaseui-textfield-invalid');
      $('.signin-email.signup #name').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').text('이름을 입력해주세요.');
      $('.signin-email.signup #name').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').removeClass('firebaseui-hidden');
    }
    if(signup_password.length < 6) {
      flag=1;
      $('.signin-email.signup #password').parents('.firebaseui-textfield').addClass('firebaseui-textfield-invalid');
      $('.signin-email.signup #password').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').text('영어 + 숫자 혼용 6자리 이상으로 입력해주세요.');
      if(signup_password.length == 0) {
        $('.signin-email.signup #password').parents().siblings('.firebaseui-error-wrapper').children('.firebaseui-error').text('비밀번호를 입력해주세요.');
      }
      $('.signin-email.signup #password').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').removeClass('firebaseui-hidden');
    }
    if(flag==1) return false;
    firebase.auth().createUserWithEmailAndPassword(signup_mail, signup_password).then(function(result) {
      //인증 성공
      /* 유저 DB생성 */
      alert('회원가입을 완료하였습니다.');
      //창닫음
      $('.signin-email input').parents('.firebaseui-textfield').removeClass('firebaseui-textfield-invalid');
      $('.signin-email input').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').addClass('firebaseui-hidden');
      $('.signin-email').addClass('hidden');
      $('.signin-email input').val('');
      $('.signin-email input').trigger('change');
      firebase.auth().signOut(); //로그아웃
      firebase.auth().currentUser.updateProfile({
        'displayName' : signup_name,
        'photoURL' : './source/img/profile-img(basic).jpg'
      }).then(function() {
        /* 유저 DB생성 */
        db.collection("users").doc(result.user.uid).set({
            name: signup_name,
            email: signup_mail,
            profileimg: './source/img/profile-img(basic).jpg',
            uid: result.user.uid,
            online: false,
            last: new Date(+ new Date()),
            creationTime: new Date(result.user.metadata.creationTime),
            provider: result.additionalUserInfo.providerId
        }).catch(function(error) { console.error("Error writing document: ", error); });
      });
    }).catch(function(error) { console.log(error.message); })
  });
  $(".signin-email.signup input").keyup(function(key) { //엔터 submit
    if (key.keyCode == 13) $('.signin-email.signup #next').trigger('click');
  });

  /*로그인*/
  $('.signin-email.signin #next').click(function() {
    var signin_mail = $('.signin-email.check #email').val();
    var signin_password = $('.signin-email.signin #password').val();
    firebase.auth().signInWithEmailAndPassword(signin_mail,signin_password).then(function() {
      //인증성공
      //창닫음
      $('.signin-email input').parents('.firebaseui-textfield').removeClass('firebaseui-textfield-invalid');
      $('.signin-email input').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').addClass('firebaseui-hidden');
      $('.signin-email').addClass('hidden');
      $('.signin-email input').val('');
      $('.signin-email input').trigger('change');
    }).catch(function(error) {
      //인증실패
      $('.signin-email.signin #password').parents('.firebaseui-textfield').addClass('firebaseui-textfield-invalid');
      $('.signin-email.signin #password').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').text('비밀번호를 잘못입력했습니다.');
      $('.signin-email.signin #password').parents('.firebaseui-textfield').siblings('.firebaseui-error-wrapper').children('.firebaseui-error').removeClass('firebaseui-hidden');
    });
  })
  $(".signin-email.signin input").keyup(function(key) { //엔터 submit
    if (key.keyCode == 13) $('.signin-email.signin #next').trigger('click');
  });

  /* 인증 상태 검사 */
  var loop1;

  firebase.auth().onAuthStateChanged(function(user) {
    if(user) {
      //인증 완료
      /* UI 변경 */
      $('.signin-popup').addClass('hidden');
      $('.left-box .login-false').addClass('hidden');
      $('.left-box .login-true').removeClass('hidden');
      $('.left-box .login-true .name').text(user.displayName);
      //온라인 상태 true
      db.collection("users").doc(user.uid).update({
          last: new Date(+ new Date()),
          online: true
      }).catch(function(error) { console.error("Error writing document: ", error); });
      now_user=user; //현재 유저 설정
      UserRooms = {}
      // 방 목록 업데이트 및 로드
      loop1 = setInterval(function() {
        for(hash in users) {
          if(users[hash].online) $(".left-box .contents-box .home .rooms-list .room#"+hash+' .profile-img').html($('<div class="online"></div>'));
          else $(".left-box .contents-box .home .rooms-list .room#"+hash+' .profile-img .online').remove();
        }
      }, 200);
      listen_room = db.collection("UserRooms").doc(now_user.uid).collection("Rooms").orderBy('time').onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
          var you_uid = change.doc.data().roomid.replace(now_user.uid, "");
          var $room;
          if (change.type === "added") {
            UserRooms[change.doc.id] = change.doc.data();
            $room = $('<div onclick="slide_in()" class="room" id="'+ you_uid +'"> <div class="profile-img" style="background:url(\''+ users[you_uid].profileimg +'\'); background-position:center; background-size:cover;"> '+ ((users[you_uid].online) ? '<div class="online"></div>' : '') +' </div> <div class="text"> <div class="t-top"> <span class="name">'+ users[you_uid].name +'</span> <span class="date">'+ (((((new Date(+ new Date())).getTime() - change.doc.data().time.getTime())/1000/60/60) >= 24) ? change.doc.data().time.getMonth() +'월 '+ change.doc.data().time.getDate() +'일' : change.doc.data().time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })) +'</span> </div> <div class="t-bottom"> <p class="preview">'+ change.doc.data().preview +'</p> </div> </div> </div>');
            $('.left-box .contents-box .home .rooms-list').prepend($room);
          }
          if (change.type === "modified") {
            UserRooms[change.doc.id] = change.doc.data();
            $room = $('<div onclick="slide_in()" class="room"  id="'+ you_uid +'"> <div class="profile-img" style="background:url(\''+ users[you_uid].profileimg +'\'); background-position:center; background-size:cover;"> '+ ((users[you_uid].online) ? '<div class="online"></div>' : '') +' </div> <div class="text"> <div class="t-top"> <span class="name">'+ users[you_uid].name +'</span> <span class="date">'+ (((((new Date(+ new Date())).getTime() - change.doc.data().time.getTime())/1000/60/60) >= 24) ? change.doc.data().time.getMonth() +'월 '+ change.doc.data().time.getDate() +'일' : change.doc.data().time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true })) +'</span> </div> <div class="t-bottom"> <p class="preview">'+ change.doc.data().preview +'</p> </div> </div> </div>');
            $('.left-box .contents-box .home .rooms-list').prepend($('.left-box .contents-box .home .rooms-list #'+ you_uid));
            $('.left-box .contents-box .home .rooms-list #'+ you_uid).replaceWith($room);
          }
          if (change.type === "removed") {
            delete UserRooms[change.doc.id];
            $('.left-box .contents-box .home .rooms-list #'+ you_uid).remove();
          }
        });
      });
    }
    else {
      //인증 해제
      $('.left-box .login-true').addClass('hidden');
      $('.left-box .login-false').removeClass('hidden');
      $('.right-box .contents-box').empty(); //채팅창 비움
      $('.right-box .header .name').text('');
      $('.right-box .header .last_online').text('');
      $('.left-box .contents-box .home .rooms-list').text('');
      clearInterval(loop);
      clearInterval(loop1);
      listen_room();// UsersRoom리스너 해제
      now_user=0; //현재 유저 초기화
      target_room = 0;
    }
  });

  /* 로그아웃 */
  $('#logout').click(function() {
    firebase.auth().signOut().then(function() {
      db.collection("users").doc(now_user.uid).update({
          last: new Date(+ new Date()),
          online: false
      }).catch(function(error) { console.error("Error writing document: ", error); });
      //헤제 완료
    }), function(error) {
      alert(error.message);
    }
  });


  /* 검 색 */
  /* 검 색 */
  /* 검 색 */
  /* 검 색 */
  /* 검 색 */

  $(".search .search-box input#search_user").keyup(function(key) { //엔터 submit
    if (key.keyCode == 13) {
      $('.search .users-list').empty(); //전에 검색한 유저들 비움
      for(hash in users) {
        if(users[hash].name == $(this).val()) { // 입력값과 데이터의 이름이 같다면
            $('.search .users-list').Print_user(users[hash].name, users[hash].profileimg, hash,  users[hash].online)
        }
      }
    }
  });
  $.fn.Print_user = function(name, profileimg, uid, online) { // 유저 출력 함수
    var $user = $('<div onclick="slide_in()" id="'+ uid +'" class="user">  <div class="profile-img" style="background:url(\''+ profileimg +'\'); background-position:center; background-size:cover;">'+ ((online) ? '<div class="online"></div>' : '') +'</div>  <span class="name">'+ name +'</span> <i class="fas fa-angle-right"></i>  </div>');
    $(this).prepend($user);
  };

  /* 방 생성 */
  /* 방 생성 */
  /* 방 생성 */
  /* 방 생성 */
  /* 방 생성 */
  var loop;
  $(document).on('click', '.users-list .user, .rooms-list .room', function() {
    if(now_user===0) { //로그인이 안되어 있을 때
      $('.signin-popup').removeClass('hidden');
      return 0; // 함수 나감
    }
    //방 생성
    clearInterval(loop);// 마지막 접속 업데이트 중지
    var roomid;
    var target_uid=$(this).attr('id');
    var flag=0;
    if(target_uid === now_user.uid) {
      $('.right-box .header #back').trigger('click');
      return 0; //자신을 눌렀을 때
    }
    for(hash in UserRooms) { //이미 방이 존재하면
      if((UserRooms[hash].users[0]==now_user.uid && UserRooms[hash].users[1]==target_uid) || UserRooms[hash].users[1]==now_user.uid && UserRooms[hash].users[0]==target_uid) {
        // 마지막 접속 표시
        $('.right-box .header .title .name').text(users[target_uid].name);
        loop = setInterval(function() {
          var last_time=((new Date(+ new Date())).getTime() - users[target_uid].last.getTime())/1000/60;
          if(!users[target_uid].online) $('.right-box .header .title .last_online').text(((last_time>=60) ? parseInt(last_time/60) +'시간 '+ parseInt(last_time%60) +'분 ' : parseInt(last_time) +'분 ') +'전에 활동');
          else $('.right-box .header .title .last_online').text('현재 활동 중');
        }, 200); //1.5초 간격으로 업데이트
        //채팅 출력
        Show_chatting(UserRooms[hash].roomid);
        flag=1;
        break;
      }
    }
    if(flag==0) { //방이 없다
      db.collection("UserRooms").doc(now_user.uid).collection("Rooms").doc(now_user.uid+target_uid).set({ //자신의 방목록에 추가
          users: [now_user.uid, target_uid],
          roomid: now_user.uid+target_uid,
          time: new Date(+ new Date()),
          preview: ""
      }).catch(function(error) { console.error("Error writing document: ", error); });
      db.collection("UserRooms").doc(target_uid).collection("Rooms").doc(now_user.uid+target_uid).set({ //상대 방 목록에 추가
          users: [now_user.uid, target_uid],
          roomid: now_user.uid+target_uid,
          time: new Date(+ new Date()),
          preview: ""
      }).catch(function(error) { console.error("Error writing document: ", error); });
      $('.right-box .header .name').text(users[target_uid].name);
      Show_chatting(now_user.uid+target_uid);
    }
  });

  /* 채팅 출력 */
  /* 채팅 출력 */
  /* 채팅 출력 */
  /* 채팅 출력 */
  /* 채팅 출력 */
  var previous_message={
    uid: "0",
    time: "0"
  };
  $.fn.Print_message = function(uid, name, profileimg, time, message) { // 유저 출력 함수
    var $message;

    var conbine = function() {
      if(previous_message.time.toLocaleString('en-GB', { year: 'numeric',  month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) == time.toLocaleString('en-GB', { year: 'numeric',  month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', hour12: true }) && previous_message.uid == uid) {
        return true;
      }
      else {
        return false;
      }

    }
    if(conbine()) {// 같다
      if(uid==now_user.uid) { //자신의 메세지 일때
        $message = $('<div class="balloon me"> <div class="text-area"> <p class="text">'+ message +'</p> </div> <span class="tooltip"><p class="time">'+ (((new Date(+ new Date())).getFullYear() == time.getFullYear() && (new Date(+ new Date())).getMonth() == time.getMonth() && (new Date(+ new Date())).getDate() == time.getDate()) ? ' ' : time.getMonth() +'월 '+ time.getDate() +'일 ') + time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) +'</p></span> </div>');
      }
      else { //상대 메세지 일때
        $message = $('<div class="balloon you"> <div class="text-area"> <p class="text">'+ message +'</p> </div> <span class="tooltip"><p class="time">'+ (((new Date(+ new Date())).getFullYear() == time.getFullYear() && (new Date(+ new Date())).getMonth() == time.getMonth() && (new Date(+ new Date())).getDate() == time.getDate()) ? ' ' : time.getMonth() +'월 '+ time.getDate() +'일 ') + time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) +'</p></span> </div>');
      }
      $(this).children('.block:last-child').append($message);
    }
    else {// 다르다
      if(uid==now_user.uid) { //자신의 메세지 일때
        $message = $('<div class="block"> <div class="balloon me"> <div class="text-area"> <p class="text">'+ message +'</p> </div> <span class="tooltip"><p class="time">'+ (((new Date(+ new Date())).getFullYear() == time.getFullYear() && (new Date(+ new Date())).getMonth() == time.getMonth() && (new Date(+ new Date())).getDate() == time.getDate()) ? ' ' : time.getMonth() +'월 '+ time.getDate() +'일 ') + time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) +'</p></span> </div> </div>');
      }
      else { //상대 메세지 일때
        $message = $('<div class="block"> <div class="balloon you"> <div class="profile-img" style="background:url(\''+ profileimg +'\'); background-position:center; background-size:cover;"></div> <div class="text-area"> <span class="name">'+ name +'</span> <p class="text">'+ message +'</p> </div> <span class="tooltip"><p class="time">'+ (((new Date(+ new Date())).getFullYear() == time.getFullYear() && (new Date(+ new Date())).getMonth() == time.getMonth() && (new Date(+ new Date())).getDate() == time.getDate()) ? ' ' : time.getMonth() +'월 '+ time.getDate() +'일 ') + time.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true }) +'</p></span> </div> </div>');
      }
      $(this).append($message);
    }



    previous_message = {
      uid: uid,
      time: time
    }

    $(this).scrollTop($(this)[0].scrollHeight);
  };
  function Show_chatting(room_id) {
    if(target_room === room_id) return 0;// 이미 들어가있는 방을 눌렀을때 걍 나감.
    /* 채팅 구현 시작 */
    var Messages;
    target_room = room_id;
    $('.right-box .contents-box').empty(); //채팅창 비움

    if(!listening_message[room_id]) {// 실시간 업데이트 하지 않을 때.
      db.collection("Message").doc(room_id).collection("message").orderBy('time').onSnapshot(function(snapshot) {
        snapshot.docChanges().forEach(function(change) {
          if (change.type === "added") {
            Messages=change.doc.data();
            if(target_room === room_id) $('.right-box .contents-box').Print_message(Messages.uid, Messages.name, Messages.profileimg, Messages.time, Messages.message);
          }
          if (change.type === "modified") {
            console.log('채팅내용이 수정 되었습니다.');
          }
          if (change.type === "removed") {
            console.log('채팅내용이 삭제 되었습니다.');
          }
        });
      });
      listening_message[room_id] = true;
    }
    else {// 실시간 업데이트 하고 있을 때.

      db.collection("Message").doc(room_id).collection("message").orderBy('time').get().then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          Messages=doc.data();
          $('.right-box .contents-box').Print_message(Messages.uid, Messages.name, Messages.profileimg, Messages.time, Messages.message);
        });
      })
      .catch(function(error) {
          console.log("Error getting documents: ", error);
      });
    }
  }

  /* 메세지 보내기 */

  $('.right-box .bottom input#message').focus(function() {
    if(!now_user || !target_room) this.blur();
  })// 로그 아웃 상태나 방에 들어가지 않았을 경우 input막음

  function Send_message(message) {
    if(!$.trim(message).length) {
      $('.right-box .bottom input#message').val('');
      return 0;
    }
    $('.right-box .bottom input#message').val('');
    db.collection("UserRooms").doc(now_user.uid).collection("Rooms").doc(target_room).update({ //방 정보 업데이트(시간, 최근 메세지)
      time: new Date(+ new Date()),
      preview: message
    }).catch(function(error) { console.error("Error writing document: ", error); });
    db.collection("UserRooms").doc(target_room.replace(now_user.uid, "")).collection("Rooms").doc(target_room).update({ //방 정보 업데이트(시간, 최근 메세지)
      time: new Date(+ new Date()),
      preview: message
    }).catch(function(error) { console.error("Error writing document: ", error); });
    db.collection("Message").doc(target_room).collection("message").doc().set({ //자신의 방목록에 추가
        message: message,
        name: users[now_user.uid].name,
        profileimg: users[now_user.uid].profileimg,
        time: new Date(+ new Date()),
        uid: now_user.uid
    }).catch(function(error) { console.error("Error writing document: ", error); });
  }
  $('.right-box .bottom .submit-btn').click(function() {
    var message=$('.right-box .bottom input#message').val();
    Send_message(message);
  })
  $('.right-box .bottom input#message').keyup(function(key) {
    if(key.keyCode == 13) $('.right-box .bottom .submit-btn').trigger('click');
  })



  /* 연락처 추가 */
  /* 연락처 추가 */
  /* 연락처 추가 */
  /* 연락처 추가 */
  /* 연락처 추가 */
  $('.right-box #add-contact').click(function() {

  })

  /* 메세지 호버시 시간표시 */
  $(document).on("mouseenter", '.balloon .text', function() {
   $(this).parents('.text-area').siblings('.tooltip').addClass('show');
  })
  $(document).on("mouseleave", '.balloon .text', function() {
   $(this).parents('.text-area').siblings('.tooltip').removeClass('show');
  })

  /* 버튼 처리 */
  $('#login').click(function() {
    $('.signin-popup').removeClass('hidden');
  })
  $('.signin-popup #close').click(function() {
    $('.signin-popup').addClass('hidden');
  })
  $('.left-box .bottom .btn#home').click(function() {
    $('.left-box .contents-box .home').removeClass('hidden');
    $('.left-box .contents-box .contact').addClass('hidden');
    $('.left-box .contents-box .search').addClass('hidden');
    $('.left-box .bottom .btn#home').addClass('active');
    $('.left-box .bottom .btn#contact').removeClass('active');
    $('.left-box .bottom .btn#search').removeClass('active');
  })
  $('.left-box .bottom .btn#contact').click(function() {
    $('.left-box .contents-box .home').addClass('hidden');
    $('.left-box .contents-box .contact').removeClass('hidden');
    $('.left-box .contents-box .search').addClass('hidden');
    $('.left-box .bottom .btn#home').removeClass('active');
    $('.left-box .bottom .btn#contact').addClass('active');
    $('.left-box .bottom .btn#search').removeClass('active');
  })
  $('.left-box .bottom .btn#search').click(function() {
    $('.left-box .contents-box .home').addClass('hidden');
    $('.left-box .contents-box .contact').addClass('hidden');
    $('.left-box .contents-box .search').removeClass('hidden');
    $('.left-box .bottom .btn#home').removeClass('active');
    $('.left-box .bottom .btn#contact').removeClass('active');
    $('.left-box .bottom .btn#search').addClass('active');
    $('.left-box .contents-box .search .search-box input#search_user').focus();
  })

  $('.right-box .header #back').click(function() {
    if($(window).width()<=700) {
      $('.left-box').css('width','100vw');
      $('.left-box .bottom').css('width','100vw');
      $('.left-box .contents-box').css('width','100vw');
    }
  })

})
