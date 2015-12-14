$(function(){
	var user = USERS['alice'];
	var box = $('#box').asciibuffer(68,26);
	function msgpage(msg,func){
		box.clear();
		var b = box.frame(0,0,0,0,true).frame(box.c,box.c,50,5,true);
		b.print(box.c,0,msg);
		var s = b.wrap(box.c,2,"[KONTYNUUJ]",'span',{'tabindex':1}).asciilink(func);
		box.redraw();
		s.focus();
	}
	function historypage(){
		box.clear();
		var frame = box.frame(0,0,0,0,true);
		menu(frame,0);
		footer(frame);
		hframe = header(frame,"Historia operacji");
		if(user.history.length == 0){
			hframe.print(0,0,'brak operacji');
		}else{
			var sum = 0;
			var pos = 0;
			for(var i=Math.max(0,user.history.length-hframe.h); i<user.history.length; i++){
				var o = user.history[i];
				var v = sprintf(" %+.2f PLN",o.value);
				var s = o.value > 0?'-> ':'<- ';
				s += o.name+' ';		
				hframe.print(0,pos++,s.rpad(hframe.w-v.length,'.')+v);
				sum += o.value;
			}
			var v = sprintf("SUMA: %+.2f PLN",sum);
			hframe.print(hframe.w-v.length,pos,v);
		}
		box.redraw();
	}
	function transferpage(){
		box.clear();
		var frame = box.frame(0,0,0,0,true);
		var tab = menu(frame,1);
		footer(frame);
		hframe = header(frame,"Nowy przelew");
		hframe.print(0,0,"Nazwa odbiorcy:");
		hframe.print(0,1,"Konto odbiorcy:");
		hframe.print(0,2,"Kwota przelewu:");
		hframe.print(19+25,2,"PLN");
		hframe.wrap(19,0,'','span',{'id':'in_name','width':33});
		hframe.wrap(19,1,'','span',{'id':'in_num','width':29});
		hframe.wrap(19,2,'0.00','span',{'id':'in_value','width':25});
		hframe.wrap(hframe.w-11,4,"[ZATWIERDŹ]",'span',{'tabindex':tab+3}).asciilink(dosend);
		hframe.wrap(0,4,"[ANULUJ]",'span',{'tabindex':tab+4}).asciilink(historypage);
		box.redraw();
		var cti_name = box.register($('#in_name').asciiinput({size:32,regex:/_/g,tabindex:tab}));
		var cti_num = box.register($('#in_num').asciiinput({size:28,regex:/[^0-9]/g,tabindex:tab+1}));
		var cti_value = box.register($('#in_value').asciiinput({size:24,regex:/[^0-9.]/g,tabindex:tab+2}));
		cti_name.input.focus()
		function error(str){
			var eframe = hframe.frame(0,9,0,3,true);
			eframe.print(1,0,str);
			box.redraw();
		}
		function dosend(){
			var name = cti_name.input.val();
			var num = cti_num.input.val();
			var value = cti_value.input.val();
			if(name.length<3){
				error("Nazwa odbiorcy musi mieć conajmniej trzy znaki");
				cti_name.input.focus();
			}else if(num.length != 28){
				error("Nieprawidłowe konto odbiorcy                  ");
				cti_num.input.focus();
			}else if(!value.match(/^[1-9][0-9]*$|^[1-9][0-9]*[.][0-9]{1,2}$|^0[.][0-9]{1,2}$/)){
				error("Nieprawidłowa kwota przelewu                  ");
				cti_value.input.focus();
			}else{
				user.history.push({'name':name,'value':-Number(value)});
				msgpage("Przelew wykonano pomyślnie.",historypage);
			}
		}
	}
	function helppage(){
		box.clear();
		var frame = box.frame(0,0,0,0,true);
		menu(frame,2);
		footer(frame);
		hframe = header(frame,"Pomoc");
		hframe.print(0,0,"uruchom ponownie komputer");
		box.redraw();
	}
	function menu(frame,who){
		var T = [
			["[HISTORIA]",historypage],
			["[PRZELEW]",transferpage],
			["[POMOC]",helppage]
		];
		var pos = 1;
		var tab = 1;
		for(var i in T){
			var o = frame.wrap(pos,0,T[i][0],'span');
			if(who != i)
				o.attr('tabindex',tab++).asciilink(T[i][1]);
			else
				frame.print(pos+1,1,'^'.repeat(T[i][0].length-2));
			pos += 1+T[i][0].length;
		}
		frame.wrap(-10,0,"[WYLOGUJ]",'span',{'tabindex':tab++}).asciilink(function(){loginpage("Wylogowano pomyślnie.");});
		var s = "użytkownik: "+user.name;
		frame.print(-s.length-1,1,s);
		return tab;
	}
	function header(frame,str){
		var len = 54;
		frame.print(box.c,3,'─'.repeat(len));
		frame.print(box.c,4,str);
		frame.print(box.c,5,'─'.repeat(len));
		return frame.frame(box.c,6,len,-8);
	}
	function footer(frame){
		frame.print(1,-2,'Rachunek: '+user.num);
		var sum = 0;
		for(var i in user.history)
			sum += user.history[i].value;
		frame.print(1,-1,sprintf('Saldo   : %.2f PLN',sum));
		frame.print(1,-1,sprintf('Saldo   : %.2f PLN',sum));
	}
	function loginpage(){
		box.clear();
		var body = box.frame(0,0,0,0,true);
		var logo = body.frame(box.c,1,49,9);
		logo.print(box.c,0," ___            _   ");
		logo.print(box.c,1,"| _ ) __ _ _ _ | |__");
		logo.print(box.c,2,"| _ \\/ _` | ' \\| / /");
		logo.print(box.c,3,"|___/\\__,_|_||_|_\\_\\");
		logo.print(0,5," ___ _     _   _                _                ");
		logo.print(0,6,"| __| |___| |_| |_ _ _ ___ _ _ (_)__ ____ _ _  _ ");
		logo.print(0,7,"| _|| / -_) / /  _| '_/ _ \\ ' \\| / _|_ / ' \\ || |");
		logo.print(0,8,"|___|_\\___|_\\_\\\\__|_| \\___/_||_|_\\__/__|_||_\\_, |");
		logo.print(0,9,"                                            |__/");
		var lframe = body.frame(box.c,-3-5,26,6,true);
		lframe.print(1,0,"Login:");
		lframe.print(1,1,"Hasło:");
		lframe.wrap(-10,3,"[ZALOGUJ]",'span',{'tabindex':3,'id':'login_btn'});
		lframe.wrap(8,0,'','span',{'id':'login','width':16});
		lframe.wrap(8,1,'','span',{'id':'pass','width':16});
		if(arguments.length > 0)
			msg(arguments[0]);
		box.redraw();
		$('#login_btn').asciilink(dologin);
		var cti_login = box.register($('#login').asciiinput({size:15,regex:/_/g,tabindex:1,onenter:dologin}));
		var cti_pass = box.register($('#pass').asciiinput({size:15,regex:/_/g,mask:'*',tabindex:2,onenter:dologin}));
		box.register(cti_login);
		box.register(cti_pass);
		cti_login.input.focus();
		function msg(str){
			var mframe = body.frame(box.c,lframe.y-5,50,3,true);
			mframe.print(1,0,str);
		}
		function dologin(){
			var l = cti_login.input.val();
			var p = cti_pass.input.val();
			if(l in USERS && USERS[l].pass == p){
				user = USERS[l];
				user.name = l;
				historypage();
				return;
			}else{;
				cti_pass.input.val('');
				cti_pass.redraw();
				msg("Niepoparawny użytkownik lub złe hasło.");
				cti_pass.input.focus();
				box.redraw();
			}
		}
		box.redraw();
	}
	loginpage();
});