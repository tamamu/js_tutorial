/*

	ここはコメントです．
	//で始まる行もコメントです．

	このファイルに書いてあるコメントは写さなくていいです．
	自分なりのコメントをつけた方が良いでしょう．

	index.htmlとgame.jsは同じフォルダに入れてください．
	回を追うごとに前回のフォルダをコピーして進めると良いかもしれません．

*/

/*
	第3回

	今回は一気にシューティングゲームっぽくします．
	(定義的には完全にシューティングゲームですね)

	今回から効果音も扱います．
	といっても爆発と弾の発射だけですが…

	ええ，ついに弾の発射を実装します．
	これで敵と熱い撃ち合いが出来ますね！

	そして敵が静止しているのではつまらないので，少し動くようにしました．
	AIと言えるほど立派なものではありませんが，十分役割を果たしてくれるでしょう．

	今回は配列変数を多用しているので混乱するかもしれませんが，よく読んで扱えるようになってください．
	ゲーム開発において配列変数は非常に重要な役目を担っています．
	このソースコードを読めば分かると思います(笑)．

	また，やはりシューティングゲームはピクセル単位での勝負なのでFPSを60に変更しました．
	更なる精度を求めるゲーマーなら120ぐらいにすると良いかもしれません．

	コード量が圧倒的に増えましたが，まだまだ序の口です．
	ゲーム開発は根気が大事です．
	今まで書いてきたコードの行数を見て自分の成長を感じましょう．

	※本来ならば2ヶ月ぐらいかけてやる内容なので多少時間がかかっても構いません．
	※焦らずゆっくりやりましょう．
*/


var canvas, ctx, bg, bgCtx;

var lastDraw=new Date();

var isPushed={left: false, up: false, right: false, down: false, z:false, x:false};

//プレイヤーの状態管理用変数
//x, yは座標
//spdは移動速度
//imageはプレイヤーの画像
//frameはプレイヤーの画像の状態
//bulletはプレイヤー弾格納用配列
//bulletLimitは同時に発射できる最大弾数
//bulletDelayは弾発射間隔調整用タイマー
//stateはプレイヤー自身の状態
var player={
	x: 240,
	y: 600,
	spd: 4,
	image: null,
	frame: 0,
	bullet: [],
	bulletLimit: 10,
	bulletDelay: new Date(),

	// 0 = 生存, 1 = 無敵, 2 = 爆発, 3 = 撃墜
	state: 0
};


var enemyImage;

//敵の状態管理用変数
//基本的にプレイヤーと一緒です
//patternは敵の行動パターン番号
//actionCountは行動パターンが継続されたフレーム数
var enemy={
	x: 240,
	y: 100,
	w: 48,
	h: 64,
	spd: 3,
	frame: 0,
	bullet: [],
	bulletLimit: 3,
	bulletDelay: new Date(),
	pattern: 0,
	actionCount: 0,

	// 0 = 生存, 1 = 爆発, 2 = 撃墜
	state: 0
}

//爆発アニメーション用画像
var expImage;

//爆発効果音用変数
var expAudio;

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


function loadImage(src, callback){
	var c=new Image();
	c.src=src;
	if(callback)c.onload=callback;
	return c;
}

//音声を読み込む関数です
//引数には音声のURLと，プールする数(同時に再生する数の最大値)を指定します
function loadAudo(src, pool){
	var c=[];
	for(var i=0;i<pool;i++){
		//この記法の説明
		c[c.length]=new Audio(src);
	}

	return c;
}

//上のloadAudio関数で作成した音声プールから効果音を再生するための関数です
//プールから再生可能な音声オブジェクトを探して再生します
function playSound(audio){
	for(var i=0;i<audio.length;i++){
		if(audio[i].paused){
			audio[i].play();
			break;
		}
	}
}

//ゲームで使用するデータをこの関数で読み込みます
function loadGameData(){
	var bgImage=loadImage("bg.png", function(){
		bgCtx.drawImage(bgImage, 0, 0);
	});

	player.image=loadImage("player.png");
	enemyImage=loadImage("enemy.png");
	expImage=loadImage("exp.png");

	expAudio=loadAudo("exp.wav", 10);
}


function mainLoop(){

	update();

	//fpsが60になるように時間を調整して画面を更新します
	if(new Date() - lastDraw > 1000/120){
		clearScreen();
		drawScreen();
		lastDraw=new Date();
	}

	requestAnimationFrame(mainLoop);
}


function update(){
	//プレイヤーが生存している場合のみキー入力を受け付けます
	if(player.state<=1){
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

	//敵の更新
	enemyAction();
	
	//弾の移動
	moveBullet();

	//プレイヤーと敵の当たり判定
	if(player.state==0 && enemy.state==0 && colCircle(player.x, player.y, 8, enemy.x, enemy.y-6, 16)){
		player.frame=0;
		player.state=2;
		playSound(expAudio);
	}

	//敵とプレイヤー弾の当たり判定
	for(var i=0;i<player.bullet.length;i++){
		if(enemy.state==0 && colDot(enemy.x-enemy.w/2, enemy.y-enemy.h/2, enemy.w, enemy.h, player.bullet[i].x, player.bullet[i].y)){
			player.bullet.splice(i, 1);
			enemy.state=1;
			playSound(expAudio);
		}
	}

	//プレイヤーと敵弾の当たり判定
	if(player.state==0){
		for(var i=0;i<enemy.bullet.length;i++){
			var bullet=enemy.bullet[i];
			var bx=bullet.x+bullet.dx;
			var by=bullet.y+bullet.dy;
			if(colCircle(player.x, player.y, 4, bx, by, 4)){
				enemy.bullet.splice(i, 1);
				player.state=2;
				playSound(expAudio);
			}
		}
	}

	//プレイヤー弾の消滅条件
	for(var i=0;i<player.bullet.length;i++){
		if(player.bullet[i].y<0)player.bullet.splice(i, 1);
	}

	//敵弾の消滅条件
	for(var i=0;i<enemy.bullet.length;i++){
		var bullet=enemy.bullet[i];
		var bx=bullet.x+bullet.dx;
		var by=bullet.y+bullet.dy;
		if(bx<0 || bx>480 || by<0 || by>640){
			enemy.bullet.splice(i, 1);
		}
	}
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

function clearScreen(){
	ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawScreen(){
	drawPlayer();
	drawEnemy();
	drawBullet();
}

function drawPlayer(){
	//プレイヤーの状態によって画像を切り替えます
	switch(player.state){
		case 0:
		case 1:
			if(player.frame==0){
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
				//爆発アニメーションが終わったらプレイヤーを撃墜状態に(今回は復活させない)
				player.state=3;
			}
		break;
		default:
		break;
	}
	
}

function drawEnemy(){
	//敵の状態によって画像を切り替えます
	switch(enemy.state){
		case 0:
			ctx.drawImage(enemyImage, 0, Math.floor(enemy.frame/2)*64, 48, 64, enemy.x-48/2, enemy.y-64/2, 48, 64);
		break;
		case 1:
			drawExplosion(enemy.x-32, enemy.y-38, Math.floor(enemy.frame/2));
		break;
	}

	enemy.frame++;

	//敵のの状態に合わせてアニメーションを進めています
	switch(enemy.state){
		case 0:
			if(enemy.frame>=6)enemy.frame=0;
		break;
		case 1:
			if(enemy.frame>=24){
				enemy.frame=0;
				//爆発アニメーションが終わったら敵を撃墜状態に
				enemy.state=2;
			}
		break;
	}	
}

//指定座標に爆発アニメーションを描きます
//スプライトシートが3*4のためこのような切り出し方をしています
function drawExplosion(x, y, frame){
	ctx.drawImage(expImage, Math.floor(frame/4)*64, (frame%4)*64, 64, 64, x, y, 64, 64);
}


//プレイヤー弾と敵弾を動かす関数です
//プレイヤー弾は直進，敵弾は角度に基づいて動かします
function moveBullet(){
	var i, bullet;

	for(i=0;i<player.bullet.length;i++){
		bullet=player.bullet[i];
		bullet.y-=10;
	}

	for(i=0;i<enemy.bullet.length;i++){
		bullet=enemy.bullet[i];
		bullet.dx-=Math.cos(bullet.angle)*5;
		bullet.dy-=Math.sin(bullet.angle)*5;
	}
}


//敵の更新関数です
//簡単なパターンに基づいて敵を動かしています
function enemyAction(){
	switch(enemy.pattern){
		case 0:
		break;
		case 1:
			enemy.x-=2;
		break;
		case 2:
			enemy.x+=2;
		break;
		case 3:
			enemy.x+=2;
		break;
		case 4:
			enemy.x-=2;
		break;
	}

	//敵弾を生成
	createEnemyBullet();

	//パターンを一定フレーム繰り返したら次のパターンへ…といった感じです
	enemy.actionCount++;
	if(enemy.actionCount>100){
		enemy.actionCount=0;
		enemy.pattern++;
		if(enemy.pattern>4)enemy.pattern=0;
	}
}

//敵弾を生成する関数です
//プレイヤーに向かうように発射角度を調整して生成します
function createEnemyBullet(){
	//条件[敵が生存している かつ 弾発射間隔を超えている かつ 画面上の敵弾が最大弾数より少ない]
	if(enemy.state==0 && new Date() - enemy.bulletDelay > 100 && enemy.bullet.length < enemy.bulletLimit){
		//プレイヤーと敵との距離を求める
		var deltaX=enemy.x-player.x;
		var deltaY=enemy.y-player.y;

		//プレイヤーと敵の距離から角度(rad)を求める
		var rad=Math.atan2(deltaY, deltaX);

		//弾を登録
		//x, yは発射位置
		//dx, dyは発射位置からの距離
		//angleは角度(rad)
		//x,yとdx,dyと分けることで複雑な弾の動きも実現可能になります
		enemy.bullet[enemy.bullet.length]={x: enemy.x, y: enemy.y, dx: 0, dy: 0, angle: rad};

		//弾発射時間を更新
		enemy.bulletDelay=new Date();
	}
}

//プレイヤー弾と敵弾を画面に描く関数
//プレイヤー弾を青色，敵弾を赤色の円で表現しています
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
	for(i=0;i<enemy.bullet.length;i++){
		bullet=enemy.bullet[i];
		ctx.beginPath();
		ctx.arc(bullet.x+bullet.dx, bullet.y+bullet.dy, 4, 0, Math.PI*2, false);
		ctx.fill();
	}
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
			default:
			break;
		}
	};
}