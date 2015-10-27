/*

	ここはコメントです．
	//で始まる行もコメントです．

	このファイルに書いてあるコメントは写さなくていいです．
	自分なりのコメントをつけた方が良いでしょう．

	index.htmlとgame.jsは同じフォルダに入れてください．
	回を追うごとに前回のフォルダをコピーして進めると良いかもしれません．

*/

/*
	第5回

	もう何も言い残すことはありません．
	あえて言うとすれば，今回は結構手抜きましたごめん許して()

	ショットのパワーアップとかにする予定でしたが，力尽きたのでスピードアップにしました．
	そのへんは自分で工夫してやってみてください．
	そんぐらいの力はついてるはずです(ついてて欲しい)．

	スコアのツイート機能に関しましてはどっかからパクって来ました(ﾃﾍﾍﾟﾛ)．
	詳しいことはTwitter APIをご覧ください．

	ここまでお付き合いいただきありがとうございました！
	次は自分だけのゲームを作ろう！！
*/


var canvas, ctx, bg, bgCtx, scoreCanvas, scoreCtx;

var lastDraw=new Date();

var isPushed={left: false, up: false, right: false, down: false, z:false, x:false, shift: false};

var player={
	x: 240,
	y: 600,
	spd: 3,
	image: null,
	frame: 0,
	bullet: [],
	bulletLimit: 10,
	bulletDelay: new Date(),
	state: 0,
	revDelay: new Date(),
	chance: 2,
	powerup: 0
};


var enemyImage;

var enemy=[];

var expImage;

var expAudio;

//BGM用変数
var BGM;

//背景画像用変数
var bgImage;
//背景スクロール用変数
var bgY=0;

//次に来る敵の陣形の番号を格納
var nextForm=0;

//ステージ時間管理用タイマー
var sceneTimer=new Date();

//スコア
var score=0;

//パワーアップアイテム画像
var powerImage;

//パワーアップアイテム用変数
var item=[];

//0=ゲーム中 1=ゲーム終了
var gameState=0;

window.onload=function(){
	canvas=document.getElementById("game");
	canvas.width=480;
	canvas.height=640;
	ctx=canvas.getContext("2d");

	bg=document.getElementById("bg");
	bg.width=480;
	bg.height=640;
	bgCtx=bg.getContext("2d");

	scoreCanvas=document.getElementById("score");
	scoreCanvas.width=320;
	scoreCanvas.height=48;
	scoreCtx=scoreCanvas.getContext("2d");
	scoreCtx.fillStyle="black";
	scoreCtx.strokeStyle="white";
	scoreCtx.lineWidth= 2;
	scoreCtx.textBaseline="top";
	scoreCtx.font="bold 36px sans-serif";
	scoreCtx.globalAlpha=.75;

	//ゲームで使用するデータをまとめて読み込みます
	loadGameData();

	//キーボードの入力を受け付けられるようにします
	setKeyboardEvent();

	//初期化
	addScore(0);

	//準備が出来たらメインループに移ります
	mainLoop();
};


function loadImage(src, callback){
	var c=new Image();
	c.src=src;
	if(callback)c.onload=callback;
	return c;
}

function loadAudo(src, pool){
	var c=[];
	for(var i=0;i<pool;i++){
		c[c.length]=new Audio(src);
	}

	return c;
}

function playSound(audio){
	for(var i=0;i<audio.length;i++){
		if(audio[i].paused){
			audio[i].play();
			break;
		}
	}
}

function loadBGM(src){
	var c=new Audio(src);
	c.loop=true;
	c.autoplay=true;
	return c;
}

function loadGameData(){
	bgImage=loadImage("bg.png");

	player.image=loadImage("player.png");
	enemyImage=loadImage("enemy.png");
	expImage=loadImage("exp.png");

	powerImage=loadImage("power.png");

	expAudio=loadAudo("exp.wav", 10);
	BGM=loadBGM("bgm.mp3");
}


function mainLoop(){

	update();

	if(new Date() - lastDraw > 1000/80){
		clearScreen();
		drawScreen();
		lastDraw=new Date();
	}

	//ゲームが終了状態の時は更新を停止します
	if(gameState===1){
		gameEnd();
	}else{
		requestAnimationFrame(mainLoop);
	}
}


function update(){
	//プレイヤーの状態が正常である時のみキー入力を受け付けます
	if(player.state===0 || (player.state===1 && new Date() - player.revDelay > 600)){
		if(isPushed.shift){
			player.spd=2;
		}else{
			player.spd=3+player.powerup;
		}
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

		//プレイヤー弾発射
		if(isPushed.z && new Date() - player.bulletDelay > 100 && player.bullet.length < player.bulletLimit){
			player.bulletDelay=new Date();
			player.bullet[player.bullet.length]={x: player.x, y: player.y};
		}
	}

	//敵の出現
	appearEnemy();

	//敵の更新
	enemyUpdate();

	//弾の移動
	moveBullet();

	//アイテムの移動
	updateItem();

	//プレイヤーとアイテムの当たり判定
	colPlayerAndItem();

	//プレイヤーと敵の当たり判定
	colPlayerAndEnemy();

	//敵とプレイヤー弾の当たり判定
	colEnemyAndBullet();

	//プレイヤーと敵弾の当たり判定
	colPlayerAndBullet();

	//プレイヤー弾の消滅条件
	deletePlayerBullet();

	//敵弾の消滅条件
	deleteEnemyBullet();

	//撃墜された敵の消滅
	destroyEnemy();
	}


function colDot(x, y, w, h, dx, dy){
	if(dx>=x && dx<=x+w && dy>=y && dy<=y+h){
		return true;
	}else{
		return false;
	}
}

function colCircle(x1, y1, r1, x2, y2, r2){
	var distance=Math.pow(x1-x2, 2) + Math.pow(y1-y2, 2);
	var radius2=Math.pow(r1+r2, 2);
	if(distance < radius2){
		return true;
	}else{
		return false;
	}
}

function colRect(px, py, x, y, w, h){
	if(px>=x && px<=x+w && py>=y && py>=y && py<=y+h){
		return true;
	}else{
		return false;
	}
}

function clearScreen(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawScreen(){
	drawBackground();
	drawItem();
	drawPlayer();
	drawEnemy();
	drawBullet();
}

function drawBackground(){
	bgCtx.drawImage(bgImage, 0, 768-bgY, 480, 768, 0, 0, 480, 768);
	bgY+=6;
	if(bgY>768){
		bgY=0;
	}
}

//スコア加算関数
function addScore(point){
	score+=point;
	scoreCtx.clearRect(0, 0, scoreCanvas.width, scoreCanvas.height);
	scoreCtx.fillText("SCORE:"+score, 0, 0);
	scoreCtx.strokeText("SCORE:"+score, 0, 0);
}

function drawPlayer(){
	if(player.state==1){
		var t=new Date() - player.revDelay;
		if(t > 1500){
			player.state=0;
		}else{
			ctx.globalAlpha=0.5;
			if(t<600)
			player.y-=6;
		}
	}
	switch(player.state){
		case 0:
		case 1:
			if(player.frame===0){
				ctx.drawImage(player.image, 0, 0, 38, 32, player.x-38/2, player.y-32/2, 38, 32);
			}else{
				ctx.drawImage(player.image, 0, player.frame*32+32, 38, 32, player.x-38/2, player.y-32/2, 38, 32);
			}
		break;
		case 2:
			drawExplosion(player.x-38/2, player.y-32/2, Math.floor(player.frame/2));
			player.frame++;
			if(player.frame>=24){
				player.frame=0;
				if(player.chance>0){
					player.state=1;
					player.chance--;
					player.revDelay=new Date();
					player.x=240;
					player.y=800;
				}else{
					player.state=3;

					//ゲームの状態を"終了"にする
					gameState=1;
				}
			}
		break;
		default:
		break;
	}
	ctx.globalAlpha=1;
}

function drawEnemy(){
	for(var i=0;i<enemy.length;i++){
		var e=enemy[i];
		switch(e.state){
			case 0:
				ctx.drawImage(enemyImage, 0, Math.floor(e.frame/2)*64, 48, 64, e.x-48/2, e.y-64/2, 48, 64);
			break;
			case 1:
				drawExplosion(e.x-32, e.y-38, Math.floor(e.frame/2));
			break;
		}

		e.frame++;

		switch(e.state){
			case 0:
				if(e.frame>=6)e.frame=0;
		break;
			case 1:
				if(e.frame>=24){
					e.frame=0;
					e.state=2;
				}
			break;
		}
	}
}

function drawExplosion(x, y, frame){
	ctx.drawImage(expImage, Math.floor(frame/4)*64, (frame%4)*64, 64, 64, x, y, 64, 64);
}

function colPlayerAndEnemy(){
	for(var i=0;i<enemy.lenth;i++){
		var e=enemy[i];
		if(player.state===0 && e.state===0 && colCircle(player.x, player.y, 8, e.x, e.y-6, 16)){
			player.frame=0;
			player.state=2;
			playSound(expAudio);
		}
	}
}

function colEnemyAndBullet(){
	for(var j=0;j<enemy.length;j++){
		var e=enemy[j];
		for(var i=0;i<player.bullet.length;i++){
			if(e.state===0 && colDot(e.x-e.w/2, e.y-e.h/2, e.w, e.h, player.bullet[i].x, player.bullet[i].y)){
				player.bullet.splice(i, 1);
				e.state=1;
				playSound(expAudio);

				//スコアを100増加
				addScore(100);
				//アイテムドロップ判定
				if(e.drop)item.push({x: e.x, y: e.y, get: false});
			}
		}
	}

}

function colPlayerAndBullet(){
	if(player.state===0){
		for(var j=0;j<enemy.length;j++){
			var e=enemy[j];
			for(var i=0;i<e.bullet.length;i++){
				var bullet=e.bullet[i];
				var bx=bullet.x+bullet.dx;
				var by=bullet.y+bullet.dy;
				if(colCircle(player.x, player.y, 4, bx, by, 4)){
					e.bullet.splice(i, 1);
					player.state=2;
					playSound(expAudio);
				}
			}
		}
	}
}

function colPlayerAndItem(){
	for(var i=0;i<item.length;i++){
		if(colRect(player.x, player.y, item[i].x, item[i].y, 32, 32)){
			player.powerup++;
			item[i].get=true;
		}
	}
}

function deleteEnemyBullet(){
	for(var j=0;j<enemy.length;j++){
		var e=enemy[j];
		for(var i=0;i<e.bullet.length;i++){
			var bullet=e.bullet[i];
			var bx=bullet.x+bullet.dx;
			var by=bullet.y+bullet.dy;
			if(bx<0 || bx>480 || by<0 || by>640){
				e.bullet.splice(i, 1);
			}
		}
	}
}

function deletePlayerBullet(){
	for(var i=0;i<player.bullet.length;i++){
		if(player.bullet[i].y<0)player.bullet.splice(i, 1);
	}
}

function destroyEnemy(){
	for(var i=0;i<enemy.length;i++){
		if(enemy[i].state==2 && enemy[i].bullet.length<=0){
			enemy.splice(i, 1);
		}
	}
}

function appearEnemy(){
	var t=new Date() - sceneTimer;
	if(t > timeTable[timeTable.length-1]){
		gameEnd();
	}else if(t > timeTable[nextForm]){
		if(enemyForm.length>nextForm){
			var form=enemyForm[nextForm];
			for(var i=0;i<form.length;i++){
				var c=new EnemyBase(form[i].type);
				c.x=form[i].x;
				c.y=form[i].y;
				if(form[i].drop)c.drop=true;
				enemy.push(c);
			}
			nextForm++;
		}
	}
}

function enemyUpdate(){
	for(var i=0;i<enemy.length;i++){
		enemy[i].update();
	}
}

function moveBullet(){
	for(var i=0;i<player.bullet.length;i++){
		bullet=player.bullet[i];
		bullet.y-=10;
	}
	for(var i=0;i<enemy.length;i++){
		for(var j=0;j<enemy[i].bullet.length;j++){
			enemy[i].bullet[j].update();
		}
	}
}

function drawBullet(){
	var i, bullet;

	ctx.fillStyle="blue";
	for(i=0;i<player.bullet.length;i++){
		bullet=player.bullet[i];
		ctx.beginPath();
		ctx.arc(bullet.x, bullet.y, 4, 0, Math.PI*2, false);
		ctx.fill();
	}

	ctx.fillStyle="red";
	for(var j=0;j<enemy.length;j++){
		var e=enemy[j];
		for(i=0;i<e.bullet.length;i++){
			bullet=e.bullet[i];
			ctx.beginPath();
			ctx.arc(bullet.x+bullet.dx, bullet.y+bullet.dy, 4, 0, Math.PI*2, false);
			ctx.fill();
		}
	}
}


//パワーアップアイテムを描く関数
function drawItem(){
	for(var i=0;i<item.length;i++){
		ctx.drawImage(powerImage, item[i].x, item[i].y);
	}
}

//パワーアップアイテムの更新関数
function updateItem(){
	for(var i=0;i<item.length;i++){
		if(item[i].get){
			item.splice(i, 1);
		}
	}
	for(var i=0;i<item.length;i++){
		item[i].y+=2;
	}
}

function gameEnd(){
	gameState=1;
	BGM.pause();
	var e=encodeURIComponent;
	var query = [
		"original_referer=javascript:close",
		"text=" + e("MCAゲーム開発講座からのツイートです。\nシューティングゲームのスコアは " + score + " です。"),
	],
	url = "https://twitter.com/intent/tweet?" + query.join("&"),
	target = "_blank",
	opts = [
		"width=550",
		"height=420",
	],
	option = opts.join(",");

  open(url, target, option);
}

function setKeyboardEvent(){
	document.onkeydown = function(e){
		e=e?e:window.event;
		switch(e.keyCode){
			case 37://←
				isPushed.left=true;
			break;
			case 38://↑
				isPushed.up=true;
			break;
			case 39://→
				isPushed.right=true;
			break;
			
			case 40://↓
				isPushed.down=true;
			break;
			
			case 90://Z
				isPushed.z=true;
			break;
			
			case 88://X
				isPushed.x=true;
			break;

			case 16://Shift
				isPushed.shift=true;
			break;
			default:
				//ここは何も書かない
			break;
		}
	};
	document.onkeyup = function(e){
		e=e?e:window.event;
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
			case 16:
				isPushed.shift=false;
			break;
			default:
			break;
		}
	};
}
