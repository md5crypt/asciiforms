String.prototype.rpad = function(length, str){
	var l = length-this.length;
	var acc = this;
	while(l --> 0)
		acc += str;
	return acc;
};

String.prototype.repeat = function(count){
    if(count < 1)
		return '';
    var result = '';
	var pattern = this.valueOf();
    while(count > 1){
		if(count&1)
			result += pattern;
        count >>= 1;
		pattern += pattern;
    }
    return result+pattern;
};

/*!
The MIT License (MIT)

Copyright (c) 2015 Marek Korzeniowski

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

$(function(){
	var edge = ['┌','┐','┘','└'];
	var hline = '│';
	var vline = '─';
	/* ******************************************
	    ASCIIBUFFER plugin
	   ****************************************** */
	$.fn.asciibuffer = function(xsize, ysize){
		var data = [];
		var obj = [];
		var reg_list = [];
		var box = $(this);
		function register(o){
			reg_list.push(o);
			return o;
		}
		function clear(){
			for(var i in reg_list)
				reg_list[i].remove();
			for(var i in obj)
				obj[i][2].remove();
			obj = [];
			reg_list = [];
			data = [];
			var line = [];
			for(var i=0; i<xsize; i++)
				line.push(' ');
			for(var i=0; i<ysize-1; i++){
				data.push(line.slice());
				data[i].push('\n');
			}
			data.push(line.slice());
		}
		function print(x,y,str){
			for(var i=0; i<str.length; i++)
				data[y][x+i] = str.charAt(i);
		}
		function wrap(x,y,str,t,o){
			o = o || {};
			s = '<'+t;
			var w = str.length;
			if('width' in o){
				w = o.width;
				delete o.width;
			}
			for(var k in o)
				s += ' '+k+'="'+o[k]+'"';
			s += '>'+str+'</'+t+'>';
			var e = $(s);
			obj.push([y*(xsize+1)+x,y*(xsize+1)+x+w,e]);
			obj.sort(function(a,b){return a[0]-b[0];});
			return e;
		}
		function redraw(){
			var focused = $(':focus');
			for(var i in obj)
				obj[i][2].detach();
			var o = '';
			for(var i=0; i<ysize; i++)
				o += data[i].join('');
			if(obj.length == 0){
				box.html(o);
			}else{
				box.html('');
				var last = 0;
				for(var i in obj){
					box.append(o.slice(last,obj[i][0]));
					box.append(obj[i][2]);
					last = obj[i][1];
				}
				box.append(o.slice(last));
			}
			focused.focus();
		}
		function coord(x,y,w,h,b){
			if(typeof(b) !== 'undefined' && b){
				data[y][x] = edge[0];
				data[y][x+w-1] = edge[1];
				data[y+h-1][x+w-1] = edge[2];
				data[y+h-1][x] = edge[3];
				for(var i=1; i<w-1; i++){
					data[y][x+i] = vline;
					data[y+h-1][x+i] = vline;
				}
				for(var i=1; i<h-1; i++){
					data[y+i][x] = hline;
					data[y+i][x+w-1] = hline;
				}
				w -= 2;
				h -= 2;
				x += 1;
				y += 1;
			}
			return {
				'frame':function(cx,cy,cw,ch,b){
					cw = (cw>0?cw:w+cw) || 0;
					ch = (ch>0?ch:h+ch) || 0;
					cx = (cx == 0x7FFFFFFF ? (((w-cw)/2)+x) : (cx>=0?cx:w+cx)+x)|0;
					cy = (cy == 0x7FFFFFFF ? (((h-ch)/2)+y) : (cy>=0?cy:h+cy)+y)|0;
					return coord(cx,cy,cw,ch,b);
				},'print':function(cx,cy,str){
					cx = (cx == 0x7FFFFFFF ? ((w-str.length)/2)+x : (cx>=0?cx:w+cx)+x)|0;
					cy = ((cy>=0?cy:h+cy)+y)|0;
					print(cx,cy,str);
				},'wrap':function(cx,cy,str,t,o){
					var cw = str.length;
					if(typeof(o) !== 'undefined' && 'width' in o)
						cw = o.width;
					cx = (cx == 0x7FFFFFFF ? ((w-cw)/2)+x : (cx>=0?cx:w+cx)+x)|0;
					cy = ((cy>=0?cy:h+cy)+y)|0;
					return wrap(cx,cy,str,t,o);
				},'w':w,'h':h,'x':x,'y':y,'c':0x7FFFFFFF
			};
		}
		box.css('width',xsize+'ch');
		box.css('height',ysize*1.15+'em');
		box.addClass('asciibuffer');
		return $.extend({'clear':clear,'redraw':redraw,'register':register},coord(0,0,xsize,ysize,0));
	}
	/* ******************************************
	    ASCIIBLINK plugin
	   ****************************************** */
	$.fn.asciilink = function(fun){
		var l = $(this);
		l.addClass('asciilink');
		var hover = 0;
		var focus = 0;
		function redraw(){
			if(hover || focus){
				l.css('color', 'white');
				l.css('background-color', 'black');
			}else{
				l.css('color', '');
				l.css('background-color', '');
			}
		}
		l.on('mouseover',function(){
			hover = 1;
			redraw();
		}).on('mouseout',function(){
			hover = 0;
			redraw();
		}).on('focusin',function(){
			focus = 1;
			redraw();
		}).on('focusout',function(){
			focus = 0;
			redraw();
		}).on('keypress',function(e){
			if(e.keyCode == 13)
				fun();
		}).on('click',fun);
		return $(this);
	}
	/* ******************************************
	    ASCIIINPUT plugin
	   ****************************************** */
	var asciiinput_count = 0;
	$.fn.asciiinput = function(options){
		var size = options.size;
		var regex = options.regex || null;
		var mask = options.mask || null;
		var span = $(this);
		var state = 0;
		var blink = null;
		var tabindex = (typeof(options.tabindex)==='undefined'?'':'tabindex="'+options.tabindex+'"');
		var input = $('<input '+tabindex+' class="asciiinput" id="asciiinput_'+(asciiinput_count++)+'" value="'+span.html()+'" />');	
		var listener = function(event){
			update();
		};
		window.addEventListener('resize', listener);
		function setblink(){
			if(blink == null){
				blink = setInterval(function(){
					state ^= 1;
					redraw();
				},500);
			}
		}
		function clearblink(){
			if(blink != null){
				clearInterval(blink);
				blink = null;
			}
		}
		if('onenter' in options){
			input.on('keypress',function(e){
				if(e.keyCode == 13)
					options.onenter();
			});
		}
		input.on('mousemove keydown',function(e){
			if(e.type == 'keydown'){
				clearblink();
				state = 1;
				setblink();
				setTimeout(redraw,1);
			}else
				redraw();
		}).focusin(function(){
			state = 1;
			setblink();
			setTimeout(redraw,1);
		}).focusout(function(){
			clearblink();
			state = 0;
			input[0].selectionStart = input.val().length;
			input[0].selectionEnd = input.val().length+1;
			redraw();
		});
		function cursor(str){
			return '<span class="asciiinput_cursor">'+str+'</span>';
		}
		function redraw(){
			var str = input.val();
			var s = input[0].selectionStart;
			var e = input[0].selectionEnd;
			if(regex){
				var c = str.replace(regex,'');
				var n = str.length - c.length;
				if(n > 0){
					input.val(c);
					s -= n;
					e -= n;
					input[0].selectionEnd = s;
					input[0].selectionStart = e;	
					str = c;
				}
			}
			if(str.length > size){
				var n = str.length-size;
				str = str.slice(0,s-n)+str.slice(s);
				input.val(str);
				s -= n;
				e -= n;
				input[0].selectionEnd = s;
				input[0].selectionStart = e;
			}
			if(mask)
				str = str.replace(/./g,mask);
			var str = str.rpad(size,'_');
			if(state == 1 || s != e){
				if(s == e)
					e++;
				if(s == size)
					str = str+cursor(' ');
				else
					str = str.slice(0,s)+cursor(str.slice(s,e))+str.slice(e)+' ';
			}else{
				str = str+' ';
			}
			span.html(str);
		}	
		function update(){
			var tmp = span.html()
			span.html(' '.repeat(size));
			input.css('top',span.offset().top);
			input.css('left',span.offset().left);
			var t = ['font-family','font-size','font-weight','font-style','font-variant','width','height'];
			for(var k in t)
				input.css(t[k],span.css(t[k]));
			span.html(tmp);
			redraw();
		}
		function remove(){
			window.removeEventListener('resize', listener);
			input.remove();
			clearblink();
		}
		$('body').append(input);
		span.css('white-space','pre');
		if(mask)
			span.html('');
		update();
		return { 'update': update, 'redraw': redraw, 'remove': remove, 'input': input };
	}
});