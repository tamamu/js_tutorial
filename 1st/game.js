/*

	ここはコメントです．
	//で始まる行もコメントです．

	このファイルに書いてあるコメントは写さなくていいです．
	自分なりのコメントをつけた方が良いでしょう．

	index.htmlとgame.jsは同じフォルダに入れてください．
	回を追うごとに前回のフォルダをコピーして進めると良いかもしれません．

*/

/*
	第1回

	今回はソフトウェア演習Aみたいなことをやります．
	もちろん，ちゃんとコードを書いて．

	プログラムと言ってもやはりHTMLとJavaScript(以下，JS)なので，普通のプログラミング言語とはやや勝手が違います．
	まず，index.htmlでWebページにゲームの画面(領域)を作る必要があります．

	艦これとかのゲームページをイメージしてもらうと分かりやすいと思います．

	それが出来たら今度はその画面をJSで取得します．

	パソコンは純粋無垢なので，いちいち教えてやらないと，どの画面でゲームを動かすのか理解出来ないからです．

	それでは実際に以下のソースコードをエディターに打ち込んでみましょう．

*/


//ここで全ての関数で使う変数を宣言します
var canvas, ctx;

//ページの読み込みが完了するのと同時に実行される関数です
window.onload=function(){

	//index.htmlの<canvas>要素を拾います
	canvas=document.getElementById("game");

	//ゲーム画面の横幅を480pxにする
	canvas.width=480;
	//ゲーム画面の高さを640pxにする
	canvas.height=640;

	//Canvasを2Dモードで開く
	ctx=canvas.getContext("2d");


	//↑↑ここまでが最低限必要な準備です↑↑


	//下で宣言した関数を呼び出す
	drawScreen();
}

//とりあえず画面に色々描いてみる関数
function drawScreen(){
	//線の長さ
	var lineLength=200;
	
	//線と四角形のX座標
	var gX=20;

	//四角形の横幅
	var boxW=400;
	//四角形の高さ
	var boxH=200;

	//塗りつぶしの色を黒にする
	ctx.fillStyle="black";
	//画面全体を塗りつぶす
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	//線の色を赤にする
	ctx.strokeStyle="red";
	//線の太さを20pxにする
	ctx.lineWidth=20;
	//線の両端を丸める(butt / round / square)
	ctx.lineCap="round";
	
	//ペンを下ろす
	ctx.beginPath();
	
	//座標を(gX, 40)に移す
	ctx.moveTo(gX, 40);
	//現在位置から(gX+lineLength, 40)まで直線を引く(予約)
	ctx.lineTo(gX+lineLength, 40);

	ctx.moveTo(gX, 80);
	ctx.lineTo(gX+lineLength*1.5, 80);

	ctx.moveTo(gX, 120);
	ctx.lineTo(gX+Math.floor(lineLength/3), 120);

	//画面に一気に反映してペンを上げる
	ctx.stroke();

	//塗りつぶし色を緑にする
	ctx.fillStyle="#00ff00";
	//座標(gX, 160)に幅boxW, 高さboxHの四角形を塗りつぶす
	ctx.fillRect(gX, 160, boxW, boxH);

	//塗りつぶし色を青にする
	ctx.fillStyle="rgb(0, 0, 255)";
	//線の色を黄色にする
	ctx.strokeStyle="rgb(255, 255, 0)";
	//線の両端を端折る
	ctx.lineCap="butt";
	ctx.lineWidth=3;

	ctx.beginPath();
	//座標(200, 480)に半径72pxの円を描く(予約)
	ctx.arc(200, 480, 72, Math.PI/180 * 0, Math.PI/180 * 360, true);
	//枠を描いてから
	ctx.stroke();
	//中を塗りつぶす
	ctx.fill();
}