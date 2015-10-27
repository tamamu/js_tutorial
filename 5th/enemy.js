//Enemyクラス定義
//これを拡張して敵の種類を増やしていきます
function EnemyBase(id){
	this.x=0;
	this.y=0;
	this.w=48;
	this.h=64;
	this.speed=EnemyType[id].speed;
	this.frame=0;
	this.bullet=[];
	this.bulletLimit=EnemyType[id].limit;
	this.bulletDelay=0;
	this.pattern=0;
	this.actionCount=0;
	this.state=0;
	this.action=EnemyType[id].action;
	this.drop=false;
}
EnemyBase.prototype.fire=function(type, option){
	if(this.state==0 && this.bullet.length<this.bulletLimit){
		var c=new EnemyBulletBase(type);
		c.x=this.x;
		c.y=this.y;
		c.init(option);
		this.bullet[this.bullet.length]=c;
		this.bulletDelay=new Date();
	}
};
EnemyBase.prototype.update=function(){
	this.action();
	this.actionCount++;
};
EnemyBase.prototype.nextPattern=function(){
	this.pattern++;
	this.actionCount=0;
};
EnemyBase.prototype.destroy=function(){
	this.state=1;
}


//敵のデータ
//以下はデータのテンプレートです．参考までに
/* 
{
	speed: 5, limit: 3,
	action: function(){
		switch(this.pattern){
			default:
				this.pattern=0;
			break;
		}
		if(new Date() - this.bulletDelay > 100)this.fire("track", {enemy:this});
		if(this.actionCount>100)this.nextPattern();
	}
}
*/
var EnemyType=[
	{//左に徐々に曲がっていく
		speed: 3, limit: 3,
		action: function(){
			switch(this.pattern){
				case 0:
					this.x-=Math.sin(this.actionCount/150)*this.speed;
					this.y+=Math.cos(this.actionCount/150)*this.speed;
				break;
				default:
					this.pattern=0;
				break;
			}
			if(new Date() - this.bulletDelay > 100)this.fire("track", {enemy:this});
			if(this.actionCount===250)this.destroy();
		}
	},
	{//右に徐々に曲がっていく
		speed: 3, limit: 3,
		action: function(){
			switch(this.pattern){
				case 0:
					this.x+=Math.sin(this.actionCount/150)*this.speed;
					this.y+=Math.cos(this.actionCount/150)*this.speed;
				break;
				default:
					this.pattern=0;
				break;
			}
			if(new Date() - this.bulletDelay > 100)this.fire("track", {enemy:this});
			if(this.actionCount===250)this.destroy();
		}
	},
	{//左に高速移動
		speed: 8, limit: 10,
		action: function(){
			switch(this.pattern){
				case 0:
					this.x-=this.speed;
				break;
				default:
					this.pattern=0;
				break;
			}
			if(new Date() - this.bulletDelay > 50)this.fire("straight", {speed: 9});
			if(this.x<-20)this.destroy();
		}
	},
	{//右に高速移動
		speed: 8, limit: 10,
		action: function(){
			switch(this.pattern){
				case 0:
					this.x+=this.speed;
				break;
				default:
					this.pattern=0;
				break;
			}
			if(new Date() - this.bulletDelay > 50)this.fire("straight", {speed: 9});
			if(this.x>500)this.destroy();
		}
	},
	{//徐々に前進放射
		speed: 8, limit: 100,
		action: function(){
			switch(this.pattern){
				default:
					this.y++;
				break;
			}
			if(this.bullet.length<50){
				for(var i=0;i<50;i++){
					this.fire("radiation", {id: this.bullet.length, gap: Math.PI/25 * this.bullet.length});
				}
			}
			if(this.y>640)this.destroy();
		}
	},
	{//右上に移動
		speed: 4, limit: 30,
		action: function(){
			switch(this.pattern){
				case 0:
					this.x+=4;
					this.y-=4;
					break;
				default:
				break;
			}
			if(new Date() - this.bulletDelay > 70)this.fire("track", {enemy:this});
			if(this.x>500)this.destroy();
		}
	},
	{//左上に移動
		speed: 10, limit: 30,
		action: function(){
			switch(this.pattern){
				case 0:
					this.x-=4;
					this.y-=4;
				break;
				default:
				break;
			}
			if(new Date() - this.bulletDelay > 70)this.fire("track", {enemy:this});
			if(this.x<-20)this.destroy();
		}
	}
];

//最後の時間はステージ終了タイム
var timeTable=[600, 2300, 5000, 6000, 8500, 10000, 12000, 14000, 15700, 18000, 18000, 25000];

//敵の陣形データ
//データの形は [ {一体分のデータ} の配列 ] の配列となっています
//x, yが出現座標
//typeがEnemyTypeで定義した敵のデータの番号です
var enemyForm=[
	[
	{x: 140, y: 0, type: 0, drop: true},
	{x: 240, y: -50, type: 0},
	{x: 340, y: -100, type: 0},
	{x: 440, y: -150, type: 0}
	],
	[
	{x: 440, y: 0, type: 1},
	{x: 340, y: -50, type: 1},
	{x: 240, y: -100, type: 1},
	{x: 140, y: -150, type: 1, drop: true}
	],
	[
	{x: 480, y: 40, type: 2},
	{x: 540, y: 40, type: 2},
	{x: 600, y: 40, type: 2},
	{x: 640, y: 40, type: 2},
	{x: 700, y: 40, type: 2},
	],
	[
	{x: 0, y: 40, type: 3},
	{x: -60, y: 40, type: 3},
	{x: -120, y: 40, type: 3},
	{x: -180, y: 40, type: 3},
	{x: -240, y: 40, type: 3},
	],
	[
	{x: 480, y: 40, type: 2},
	{x: 0, y: 40, type: 3},
	{x: 540, y: 40, type: 2},
	{x: -60, y: 40, type: 3, drop: true},
	{x: 600, y: 40, type: 2},
	{x: -120, y: 40, type: 3},
	{x: 660, y: 40, type: 2},
	{x: -180, y: 40, type: 3}
	],
	[
	{x: 180, y: 40, type: 4},
	{x: 240, y: 80, type: 4, drop: true},
	{x: 300, y: 40, type: 4}
	],
	[
	{x: 140, y: 0, type: 1},
	{x: 240, y: -50, type: 1},
	{x: 340, y: -100, type: 1},
	{x: 440, y: -150, type: 1}
	],
	[
	{x: 440, y: -150, type: 0},
	{x: 340, y: -100, type: 0},
	{x: 240, y: -50, type: 0},
	{x: 140, y: 0, type: 0}
	],
	[
	{x: -40, y: 560, type: 5, drop: true},
	{x: -80, y: 600, type: 5},
	{x: -120, y: 640, type: 5},
	{x: -160, y: 680, type: 5},
	{x: -200, y: 720, type: 5}
	],
	[
	{x: 520, y: 560, type: 6, drop: true},
	{x: 560, y: 600, type: 6},
	{x: 600, y: 640, type: 6},
	{x: 640, y: 680, type: 6},
	{x: 680, y: 720, type: 6}
	]
];