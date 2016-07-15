'use strict';

/*
 * logcatにて"MEASURE:XXXXX; comment"というキーワード間の時間をus単位で計測・表示

 * sample format
 * ---input---
 * MEASURE:TRANSITION; start
 * MEASURE:TRANSITION; end
 * ---output--
 * time: XXX us TRANSITION 
 * --------
 */

/*
 * settings;
 */
var filters = []; // ログ自体のフィルタをする場合は追加
var diffOnly = false; // 時間計測のみで良い場合はtrueにする
var measureKey      = 'MEASURE:';
var clearMeasureKey = 'CLEAR_MEASURE';

/*
 * requirements;
 */
var util   = require('util');
var us     = require('microseconds');
var colors = require('colors');
var spawn  = require('child_process').spawn;

/*
 * variables;
 */
var time1, time2, diff;
var measureResult = '', startsKey = '', starts = {}, line = '';
var tmp = [];

/*
 * main
 */
spawn("adb", ["logcat", "-c"]);
setTimeout(function(){

var tail = spawn("adb", ["logcat"]);
tail.stdout.on("data", function (data) {
	var now = us.now();
	var log = data.toString('utf8');
	var arr = log.split('\r\n');

	while(line = arr.shift()) {

		// filter
		var skip = true;
		if (filters.length == 0) {
			skip = false;
		} else {
			for (var i = 0; i < filters.length; i++) {
				if (line.indexOf(filters[i]) >= 0) {
					skip = false;
					break;
				}
			}
		}
		if (skip) {
			continue;
		}

		// clear
		if (line.indexOf(clearMeasureKey) >= 0) {
			starts = {};
			continue;
		}

		if (line.indexOf(measureKey) >= 0) {
			tmp = line.substr(line.indexOf(measureKey)).split(';');
			if (tmp && tmp.length > 0) {
				var out = tmp[0].split(':');
				out = (out.length > 1) ? out[1] : '';
				startsKey = tmp[0];

				if (starts.hasOwnProperty(startsKey)) {
					diff = parseInt(us.since(starts[startsKey]), 10);
					measureResult = 'time: \t' + 
						String(diff).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, '$1,') + ' us \t' +
						'keyword: \t ' + out;
					console.log(measureResult.red);
					starts[startsKey] = now;
				} else {
					starts[startsKey] = now;
				}
			}
		}	

		if (!diffOnly) {
			// 出力 (coloring)
			switch (line[0]) {
				case 'W':
					line = line.yellow;
					break;
				case 'E':
					line = line.red;
					break;
				case 'D':
				case 'V':
					if (line.indexOf('RED') >= 0) {
						line = '\u001b[31m' + line.replace('RED','') + '\u001b[0m';
					} else if (line.indexOf('GREEN') >= 0) {
							line = '\u001b[32m' + line.replace('GREEN','') + '\u001b[0m';
					} else if (line.indexOf('YELLOW') >= 0) {
						line = '\u001b[33m' + line.replace('YELLOW','') + '\u001b[0m';
					} else if (line.indexOf('BLUE') >= 0) {
						line = '\u001b[34m' + line.replace('BULE','') + '\u001b[0m';
					} else {
						line = '\u001b[37m' + line + '\u001b[0m';
					}
					break;
				default:
					break;
			}

			// log 出力
			line = parseInt(now, 10) + ' ' + line;
			console.log(line);
		}
	}
});

}, 1000);
