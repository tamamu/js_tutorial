/*

	ここはコメントです．
	//で始まる行もコメントです．

	このファイルに書いてあるコメントは写さなくていいです．
	自分なりのコメントをつけた方が良いでしょう．

	index.htmlとgame.jsは同じフォルダに入れてください．
	回を追うごとに前回のフォルダをコピーして進めると良いかもしれません．

*/

/*
	画像素材はここを利用させて頂きました
	http://stg.iaigiri.com/
*/

/*
	第2回

	今回はゲームの基礎を作ります(内容が盛りだくさん！)
	次回に向けての準備なのでまだゲームらしくないですが，とても重要な回です．

	今回実装する機能(関数)は，
	・キーボードの入力処理
	・画像の読み込み(処理の簡略化)
	・ゲーム本体のループ(中身は次回以降！)
	・当たり判定
	の4つです．

	当たり判定とかまさにゲームらしいですね！！
	キーボードの入力も取れるようになるので実際に操作出来るようになります．
	自分でキーボードの入力からキャラクターの移動処理までを書く苦労と感動を味わってください！



	JSでは，画像の読み込みは2つの処理から成り立っています．
	1枚だけ読み込むならそれでもいいのですが，枚数が多くなってくると面倒です．
	だったら1つの関数にまとめてしまいましょう！


	今回は画像を読み込んで，その移動と当たり判定のテストをしてみます．
	また，背景画像を表示するためにCanvasをHTML側で2層に重ねています．
	地味にアニメーションもさせています(ちょっと難しいかも)

	当たり判定が正しく行われているかはブラウザのログで確認してください．
	ブラウザのログの開き方は，当たり判定関数のコメントに書いてあります．


	コメント書くのに力尽きたので解説でしっかり説明します！！！！！！

*/


var canvas, ctx, bg, bgCtx;

//fps調整用タイマー
var lastDraw=new Date();

//キーボード入力管理用変数
//このような形の変数を連想配列(またはハッシュテーブル)と言います
//コロンの左側がキー，右側がその値になっています
//それぞれの値にアクセスするには，変数名.キー と書きます
//この場合は isPushed.left とか isPushed.x ですね
var isPushed={left: false, up: false, right: false, down: false, z:false, x:false};

//プレイヤーの状態管理用変数
//x, yは座標
//spdは移動速度
//imageはプレイヤーの画像
//frameはプレイヤーの画像の状態
var player={
	x: 100,
	y: 100,
	spd: 4,
	image: null,
	frame: 0
};


//敵の画像用変数
var enemyImage;

//敵の状態管理用変数
//基本的にプレイヤーと一緒です
var enemy={
	x: 200,
	y: 300,
	spd: 3,
	frame: 0
}

//ページの読み込みが完了するのと同時に実行される関数です
window.onload=function(){
	canvas=document.getElementById("game");
	canvas.width=480;
	canvas.height=640;
	ctx=canvas.getContext("2d");

	bg=document.getElementById("bg");
	bg.width=480;
	bg.height=640;
	bgCtx=bg.getContext("2d");


	//点と矩形の当たり判定関数のテストをします
	//このように関数などの単位ごとにテストを行うことをユニットテストと言います
	//全てのテストをクリア出来ていれば正しく実装出来ています(ブラウザのログを見てみましょう)
	//Google ChromeならCtrl+Shift+J
	//FirefoxならCtrl+Shift+K
	//--------ユニットテスト--------
	if(colDot(0, 0, 320, 240, 0, 0)){
		console.log("点衝突テスト1クリア");
	}
	if(colDot(0, 0, 320, 240, 0, 240)){
		console.log("点衝突テスト2クリア");
	}
	if(colDot(0, 0, 320, 240, 320, 0)){
		console.log("点衝突テスト3クリア");
	}
	if(colDot(0, 0, 320, 240, 320, 240)){
		console.log("点衝突テスト4クリア");
	}
	if(colDot(0, 0, 320, 240, 160, 120)){
		console.log("点衝突テスト5クリア");
	}
	//------------------------------


	//ゲームで使用するデータをまとめて読み込みます
	loadGameData();

	//キーボードの入力を受け付けられるようにします
	setKeyboardEvent();

	//準備が出来たらメインループに移ります
	mainLoop();
}


//画像を読み込む関数です
//引数には画像のURLと，任意でコールバック関数を指定します
//コールバック関数は画像の読み込みが完了すると実行されます
function loadImage(src, callback){
	var c=new Image();
	c.src=src;
	if(callback)c.onload=callback;
	return c;
}

//ゲームで使用するデータをこの関数で読み込みます
function loadGameData(){
	var bgImage=loadImage("bg.png", function(){
		bgCtx.drawImage(bgImage, 0, 0);
	});

	player.image=loadImage("player.png");
	enemyImage=loadImage("enemy.png");
}


//メインループです
//ここにゲーム本体の処理を書いていきます
function mainLoop(){
	//まずゲーム全体の状態の更新してます
	update();

	//fpsが30になるように時間を調整して画面を更新します
	if(new Date() - lastDraw > 1000/30){
		clearScreen();
		drawScreen();
		lastDraw=new Date();
	}

	//この関数を再び呼ぶことによってループさせています
	//本来ならウェイトが無いと無限ループでブラウザが固まってしまいますが
	//この関数を通して呼び出すことによってそれを回避しています
	requestAnimationFrame(mainLoop);
}

//ゲームの状態を更新する関数です
//キーボード入力の処理などもここで行います
function update(){
	if(isPushed.left){
		player.x-=player.spd;
		player.frame=3;
	}else if(isPushed.right){
		player.x+=player.spd;
		player.frame=1;
	}else{
		player.frame=0;
	}
	if(isPushed.up){
		player.y-=player.spd;
	}else if(isPushed.down){
		player.y+=player.spd;
	}

	//プレイヤーと敵の当たり判定を行っています
	if(colCircle(player.x, player.y, 8, enemy.x, enemy.y, 16)){
		console.log("敵と衝突！！");
	}
	
}


//当たり判定関数です
//当たっていればtrue, 当たっていなければfalseを返します
//矩形と点の当たり判定
function colDot(x, y, w, h, dx, dy){
	//点(dx, dy)が矩形(x, y, w, h)の内部にあれば当たっています
	if(dx>=x && dx<=x+w && dy>=y && dy<=y+h){
		return true;
	}else{
		return false;
	}
}

//円と円の当たり判定
function colCircle(x1, y1, r1, x2, y2, r2){
	//三平方の定理より，円1と円2の中心座標の距離の2乗は (※^2は2乗)
	// (x1-x2)^2 + (y1-y2)^2
	var distance=Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2);
	var radius2=Math.pow(r1+r2, 2);

	//2つの円の半径の和より中心距離が短ければ当たっています
	if(distance < radius2){
		return true;
	}else{
		return false;
	}
}



//画面をまっさらな状態にする関数です
function clearScreen(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}


//画面を更新する関数
//プレイヤーと敵を画面に描いています
function drawScreen(){
	drawPlayer();
	drawEnemy();
}

//プレイヤーの画像を画面に描く関数です
function drawPlayer(){
	//プレイヤーの状態ごとに画像を振り分け
	//プレイヤーの画像を見ると分かるのですが，2枚目にあたる画像が影になっているので，
	//2枚目を飛ばすために処理をifで分けています

	//drawImageはその名の通り，画像を描く関数です
	//引数は左から，
	//描く画像，切り取るX座標，Y座標，横幅，高さ，
	//描く先のX座標，Y座標，横幅，高さ

	//今回はプレイヤーと敵の座標を中心座標として扱うために，
	//描画位置を画像のサイズの半分ずらしています

	if(player.frame==0){
		ctx.drawImage(player.image, 0, 0, 38, 32, player.x-38/2, player.y-32/2, 38, 32);
	}else{
		ctx.drawImage(player.image, 0, player.frame*32+32, 38, 32, player.x-38/2, player.y-32/2, 38, 32);
	}
}

//敵の画像を画面に描く関数です
function drawEnemy(){
	//敵はアニメーションさせます
	//2フレームごとに画像を切り替えます
	ctx.drawImage(enemyImage, 0, Math.floor(enemy.frame/2)*64, 48, 64, enemy.x-48/2, enemy.y-64/2, 48, 64);

	//ここでアニメーションの状態を進めています
	enemy.frame++;
	//もしも最後の画像まで来たら最初の画像に戻してループします
	if(enemy.frame>=6)enemy.frame=0;
}


//キーボードの入力を処理するための関数です
//キーの状態は連想配列変数isPushedに格納します
//押されていればtrue, 押されていなければfalse, といった具合です
function setKeyboardEvent(){

	//キーが押されたと同時に実行される関数です
	document.onkeydown = function(e){

		//この行は理解しなくても大丈夫です
		//あえて言うならば，IEと他のブラウザとの差を考慮しています
		e=e?e:window.event;

		//押されたキーによって場合分けします
		//キーコード(キーの番号)の一覧はここに載っています https://web-designer.cman.jp/javascript_ref/keyboard/keycode/
		switch(e.keyCode){
			//←
			case 37:
				isPushed.left=true;
			break;

			//↑
			case 38:
				isPushed.up=true;
			break;

			//→
			case 39:
				isPushed.right=true;
			break;

			//↓
			case 40:
				isPushed.down=true;
			break;

			//Z
			case 90:
				isPushed.z=true;
			break;

			//X
			case 88:
				isPushed.x=true;
			break;

			//それ以外
			default:
				//ここは何も書かない
			break;
		}

	};

	//キーから指を離したと同時に実行される関数です
	document.onkeyup = function(e){

		//この行は理解しなくても大丈夫です
		e=e?e:window.event;

		//指を離したキーによって場合分けします
		switch(e.keyCode){
			case 37:
				isPushed.left=false;
			break;

			case 38:
				isPushed.up=false;
			break;

			case 39:
				isPushed.right=false;
			break;

			case 40:
				isPushed.down=false;
			break;

			case 90:
				isPushed.z=false;
			break;

			case 88:
				isPushed.x=false;
			break;

			default:
				//ここは何も書かない
			break;
		}

	};

}