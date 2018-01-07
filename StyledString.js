"use strict";

function StyledString(str) {
	//	Private properties:
	let _string;
	let _styledString;
	let _styleMap;

	//	 Setters/getters:
	Object.defineProperty(StyledString.prototype, "innerHTML", {
		get: function() {
			return createHTML();
		}
	});

	Object.defineProperty(StyledString.prototype, "textContent", {
		get: function() {
			return _string;
		}
	});

	//	Private methods:
	let updateStyleMap = function(stylingObj, index) {
		switch(stylingObj.styleType) {
			case "color":
				_styleMap[index].color = stylingObj.styleValue;
				break;
			case "font-size":
				_styleMap[index].fontSize = stylingObj.styleValue;
				break;
			case "font-weight":
				if(stylingObj.styleValue === "bold") {
					_styleMap[index].bold = true;
				}
				break;
			case "font-style":
				if(stylingObj.styleValue === "italic") {
					_styleMap[index].italic = true;
				}
				break;
			case "text-decoration":
				if(stylingObj.styleValue === "line-through") {
					_styleMap[index].strike = true;
				} else if(stylingObj.styleValue === "underline") {
					_styleMap[index].underline = true;
				}
				break;
		}
	};

	let setStyle = function(stylingObj, beginIndex, endIndex) {
		if("styleType" in stylingObj && "styleValue" in stylingObj) {
			let _beginIndex = mapIndex(beginIndex, _string.length);
			let _endIndex = Number.isInteger(endIndex) ? mapIndex(endIndex, _string.length) : _string.length;

			for(let _curEl = _beginIndex; _curEl < _endIndex; _curEl++) {
				updateStyleMap(stylingObj, _curEl);
			}
		}
	};

	let createHTML = function() {
		let _innerHTML = "";
		let _curColor, _curFontSize, _curBold, _curItalic, _curUnderline, _curStrike;
		let _prevColor, _prevFontSize, _prevBold, _prevItalic, _prevUnderline, _prevStrike;
		let _needToCloseSpan = false;
		let _closeSpan = "</span>";

		for(let _curEl = 0; _curEl < _styleMap.length; _curEl++) {
			_curColor = _styleMap[_curEl].color;
			_curFontSize = _styleMap[_curEl].fontSize;
			_curBold = _styleMap[_curEl].bold;
			_curItalic = _styleMap[_curEl].italic;
			_curUnderline = _styleMap[_curEl].underline;
			_curStrike = _styleMap[_curEl].strike;
			if(_curEl != 0) {
				_prevColor = _styleMap[_curEl - 1].color;
				_prevFontSize = _styleMap[_curEl - 1].fontSize;
				_prevBold = _styleMap[_curEl - 1].bold;
				_prevItalic = _styleMap[_curEl - 1].italic;
				_prevUnderline = _styleMap[_curEl - 1].underline;
				_prevStrike = _styleMap[_curEl - 1].strike;
			}
			if( _curColor !== _prevColor || 
				_curFontSize !== _prevFontSize ||
				_curBold !== _prevBold ||
				_curItalic !== _prevItalic ||
				_curUnderline !== _prevUnderline ||
				_curStrike !== _prevStrike) {
				if(_needToCloseSpan) {
					_innerHTML += _closeSpan;
					_needToCloseSpan = false;
				}
				if(_curColor || _curFontSize || _curBold || _curItalic || _curUnderline || _curStrike) {
					_innerHTML += "<span style=\"";
					if(_curBold) {
						_innerHTML += "font-weight: bold; ";
					}
					if(_curItalic) {
						_innerHTML += "font-style: italic; ";
					}
					if(_curStrike && _curUnderline) {
						_innerHTML += "text-decoration: underline line-through; ";
					} else if(_curStrike) {
						_innerHTML += "text-decoration: line-through; ";
					} else if(_curUnderline) {
						_innerHTML += "text-decoration: underline; ";
					}
					if(_curColor) {
						_innerHTML += "color: " + _curColor + "; ";
					}
					if(_curFontSize) {
						_innerHTML += "font-size: " + _curFontSize + "; ";
					}
					_innerHTML += "\">";
					_innerHTML += _string[_curEl];
					_needToCloseSpan = true;
				} else {
					_innerHTML += _string[_curEl];
				}
			} else {
				_innerHTML += _string[_curEl];
			}

			/*
			 * 	If the last element of _styleMap is not an emptyStylingObj,
			 *	we need to close the <span> tag.
			 */
			if(_curEl === _styleMap.length - 1 && _needToCloseSpan) {
				_innerHTML += _closeSpan;
			} 
		}
		return _innerHTML;
	};

	let mapIndex = function(index, arraySize) {
		let _index = 0;
		if(Number.isInteger(index)) {
			if(index < 0) {
				_index = arraySize + index;
				if(_index < 0) {
					_index = 0;
				}
			} else {
				_index = index;
			}
		}
		return _index;
	};

	//	Public methods:
	StyledString.prototype.insert = function(substr, index) {
		let _index = mapIndex(index, _string.length);
		_string = _string.slice(0, _index) + substr + _string.slice(_index);
		let emptyStylingObj = {
			color: false,
			fontSize: false,
			bold: false,
			italic: false,
			underline: false,
			strike: false,
		}
		let _maxLength = substr.length + _index;
		for(let _curEl = _index; _curEl < _maxLength; _curEl++) {
			if(_curEl !== 0) {
				let stylingObj = {
					color: _styleMap[_index - 1].color,
					fontSize: _styleMap[_index - 1].fontSize,
					bold: _styleMap[_index - 1].bold,
					italic: _styleMap[_index - 1].italic,
					underline: _styleMap[_index - 1].underline,
					strike: _styleMap[_index - 1].strike,
				}
				_styleMap.splice(_curEl, 0, stylingObj);
			} else {
				_styleMap.splice(_curEl, 0, emptyStylingObj);
			}
		}
	}

	StyledString.prototype.style = function(styling, beginIndex, endIndex) {
		if(styling && styling.constructor === Array) {
			for(let _curEl = 0; _curEl < styling.length; _curEl++) {
				setStyle(styling[_curEl], beginIndex, endIndex);
			}
		} else if(styling && styling.constructor === Object) {
			setStyle(styling, beginIndex, endIndex);
		}
	}

	//	 Constructor code:
	if(str === null || str === undefined) {
		_string = "";
	} else {
		_string = String(str);
	}
	_styleMap = new Array(_string.length);
	for(let _curEl = 0; _curEl < _string.length; _curEl++) {
		_styleMap[_curEl] = {
			color: false,
			fontSize: false,
			bold: false,
			italic: false,
			underline: false,
			strike: false,
		};
	}
}