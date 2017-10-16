var App = function() {
  var ganakana = {
    hana: {
      aline: ['あ', 'い', 'う', 'え', 'お', 'ア', 'イ', 'ウ', 'エ', 'オ'],
      kaline: ['か', 'き', 'く', 'け', 'こ', 'カ', 'キ', 'ク', 'ケ', 'コ'],
      saline: ['さ', 'し', 'す', 'せ', 'そ', 'サ', 'シ', 'ス', 'セ', 'ソ'],
      taline: ['た', 'ち', 'つ', 'て', 'と', 'タ', 'チ', 'ツ', 'テ', 'ト'],
      naline: ['な', 'に', 'ぬ', 'ね', 'の', 'ナ', 'ニ', 'ヌ', 'ネ', 'ノ'],
      haline: ['は', 'ひ', 'ふ', 'へ', 'ほ', 'ハ', 'ヒ', 'フ', 'ヘ', 'ホ'],
      maline: ['ま', 'み', 'む', 'め', 'も', 'マ', 'ミ', 'ム', 'メ', 'モ'],
      yaline: ['や', 'い', 'ゆ', 'え', 'よ', 'ヤ', 'イ', 'ユ', 'エ', 'ヨ'],
      raline: ['ら', 'り', 'る', 'れ', 'ろ', 'ラ', 'リ', 'ル', 'レ', 'ロ'],
      waline: ['わ', 'い', 'う', 'え', 'を', 'ワ', 'イ', 'ウ', 'エ', 'ヲ']
    },
    bingo: {
      aline: ['a', 'i', 'u', 'e', 'o'],
      kaline: ['ka', 'ki', 'ku', 'ke', 'ko'],
      saline: ['sa', 'shi', 'su', 'se', 'so'],
      taline: ['ta', 'chi', 'tsu', 'te', 'to'],
      naline: ['na',　'ni',　'nu',　'ne',　'no'],
      haline: ['ha', 'hi', 'fu', 'he', 'ho'],
      maline: ['ma', 'mi', 'mu', 'me', 'mo'],
      yaline: ['ya',　'i', 'yu', 'e', 'yo'],
      raline: ['ra', 'ri', 'ru', 're', 'ro'],
      waline: ['wa', 'i', 'u', 'e', 'o']
    },
    shuffledRomaji: {}
  };

  var answerSheet = {};

  var output = $(".output");

  var shuffleArray = function(array) {
    var j, x, i;
    for (i = array.length; i; i--) {
        j = Math.floor(Math.random() * i);
        x = array[i - 1];
        array[i - 1] = array[j];
        array[j] = x;
    }
    return array;
  }

  var shuffleRomajiArray = function() {
    var romajiArray = [];
    for (var a in ganakana.bingo) {
      Array.prototype.push.apply(romajiArray, ganakana.bingo[a]);
    }
    ganakana.shuffledRomaji = shuffleArray(romajiArray);
  };

  var render = function(tmpl, data) {
    output.html(juicer($("#" + tmpl).html(), data))
  };

  var renderHome = function() {
    var homeData = []
    for (var j in ganakana.hana) {
      homeData.push({
        id: j,
        name: ganakana.hana[j][0]
      });
    }
    render("choose-tmpl", {clickables: homeData});
  };

  var renderQuestion = function(line) {
    var randomItem = function(items) {
      return items[Math.floor(Math.random() * items.length)];
    };
    var choiceGroup = [];
    for (var c in ganakana.bingo[line]) {
      choiceGroup.push({
        group: line,
        item: ganakana.bingo[line][c]
      });
    }

    render("ganakana-tmpl", {
      char_name: randomItem(ganakana.hana[line]),
      choices: shuffleArray(choiceGroup),
      clock: timestampToStr(answerSheet.now_timestamp),
      current_count: answerSheet.current_count,
      correct: answerSheet.correct,
      wrong: answerSheet.current_count - answerSheet.correct,
      errors: answerSheet.errors
    });

    if (answerSheet.now_timestamp === 0) {
      clockStart();
    }
  };

  var renderDictation = function() {
    var _renderDictation = function(_remain) {
      if (answerSheet.order >= ganakana.shuffledRomaji.length) {
        clockStop();
        alert("听写完毕");
        Q.go('home');
      } else {
        render("tingxie-tmpl", {
          char_name: ganakana.shuffledRomaji[answerSheet.order],
          count_down: _remain
        });
      }
    };

    var _countDown = function(callback) {
      callback(answerSheet["remain"]);
      answerSheet["remain"] -= 1;
      if (answerSheet["remain"] < 0) {
        answerSheet["remain"] = 3;
        answerSheet.order += 1;
      }
    };

    answerSheet["remain"] = 3;
    answerSheet.timer.push(setInterval(function() {
      _countDown(_renderDictation);
    }, 1000))
  };

  var timestampToStr = function(timestamp) {
    var minutes = parseInt(timestamp / 60, 10);
    var seconds = timestamp - minutes * 60;
    return (minutes < 10 ? '0' : '') + minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  }

  var clockStart = function() {
    var _clockStart = function() {
      answerSheet.now_timestamp += 1;
      $('.clock').html(timestampToStr(answerSheet.now_timestamp));
    }
    answerSheet.timer.push(setInterval(function() {
      _clockStart();
    }, 1000));
  };

  var clockStop = function() {
    for (var i in answerSheet.timer) {
      clearInterval(answerSheet.timer[i]);
    }
    answerSheet.timer = [];
  };

  var cleanAnswerSheet = function() {
    answerSheet.correct = 0;
    answerSheet.limit = 100;
    answerSheet.current_count = 0;
    answerSheet.errors = [];
    answerSheet.timer = [];
    answerSheet.now_timestamp = 0;
    answerSheet.tings = [];
    answerSheet.tings_limit = 50;
    answerSheet.order = 0;
    answerSheet.romas = [];
  };

  var getRomaji = function(item, line) {
    // TODO support variable number of array
    return ganakana.bingo[line][ganakana.hana[line].indexOf(item) % 5];
  };

  var checkAnswer = function(answer, line) {
    var item = $('#char').html();
    var correntAnswer = getRomaji(item, line);
    if (correntAnswer === answer) {
      answerSheet.correct += 1;
    } else {
      answerSheet.errors.push({
        name: item,
        sound: correntAnswer
      })
    }
    answerSheet.current_count += 1
    if (answerSheet.current_count < answerSheet.limit) {
      renderQuestion(line);
    } else {
      cleanAnswerSheet();
      alert('100道题回答完毕');
      Q.go('home');
    }
  };

  var bindAction = function() {
    $('body').on('click', '#tingstop', function() { // TODO add stop button
      clockStop();
    })
    .on('click', '.choice', function() {
      if (answerSheet.current_count >= 100) {
        clockStop();
      } else {
        checkAnswer($(this).text(), $(this).data('id'));
      }
    })
  };

  return {
    init: function() {
      shuffleRomajiArray();
      bindAction();
    },
    home: function() {
      clockStop();
      cleanAnswerSheet();
      renderHome();
    },
    dictation: function() {
      renderDictation()
    },
    chooseQuestion: function(line) {
      renderQuestion(line);
    },
    chooseQuestionGroup: function(line) {
      alert("我还没有写呀。");
    }
  }
}();

$(document).ready(function() {
  // init basic click trigger
  App.init();

  // page router handle
  Q.reg('home', function() {
    App.home();
  }).reg('c', function(line) {
    App.chooseQuestion(line);
  }).reg('g', function(line) {
    App.chooseQuestionGroup(line);
  }).reg('t', function(line) {
    App.dictation();
  }).init({
    index: 'home'
  }).go('home');
});
