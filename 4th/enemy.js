//Enemyクラス定義
//これを拡張して敵の種類を増やしていきます
function EnemyBase(id){
	this.x=0;
	this.y=0;
	this.w=48;
	this.h=64;
	this.spd=EnemyType[id].speed;
	this.frame=0;
	this.bullet=[];
	this.bulletLimit=EnemyType[id].limit;
	this.bulletDelay=0;
	this.pattern=0;
	this.actionCount=0;
	this.state=0;
	this.action=EnemyType[id].action;

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
	{
		speed: 5, limit: 3,
		action: function(){
			switch(this.pattern){
				case 0:
				break;
				case 1:
					this.x-=1;
				break;
				case 2:
					this.x+=1;
				break;
				case 3:
					this.x+=1;
				break;
				case 4:
					this.x-=1;
				break;
				default:
					this.pattern=0;
				break;
			}
			if(new Date() - this.bulletDelay > 100)this.fire("track", {enemy:this});
			if(this.actionCount>100)this.nextPattern();
		}
	},
	{
		speed: 10, limit: 100,
		action: function(){
			switch(this.pattern){
				default:
				break;
			}
			if(this.bullet.length<50){
				for(var i=0;i<50;i++){
					this.fire("radiation", {id: this.bullet.length%50, gap: Math.PI/18 * this.actionCount/100});
				}
			}
		}
	},
	{
		speed: 10, limit: 100,
		action: function(){
			switch(this.pattern){
				case 0:
					if(this.bullet.length<50){
						if(new Date() - this.bulletDelay > 50){
							this.fire("straight");
						}
					}
				break;
				case 1:
					if(this.bullet.length<50){
						for(var i=0;i<50;i++){
							this.fire("radiation", {id: this.bullet.length%50, gap: Math.PI/18 * this.actionCount/100});
						}
					}
				break;
				default:
					this.pattern=0;
				break;
			}
			if(this.actionCount>300)this.nextPattern();
		}
	}
];

//敵の陣形データ
//データの形は [ {一体分のデータ} の配列 ] の配列となっています
//x, yが出現座標
//typeがEnemyTypeで定義した敵のデータの番号です
var enemyForm=[
	[{
		x: 140,
		y: 100,
		type: 0
	},
	{
		x: 240,
		y: 100,
		type: 0
	},
	{
		x: 340,
		y: 100,
		type: 0
	}],
	[{
		x: 300,
		y: 150,
		type: 0
	},
	{
		x: 400,
		y: 200,
		type: 0
	}
	],
	[{
		x: 50,
		y: 200,
		type: 1
	},
	{
		x: 240,
		y: 150,
		type: 1
	},
	{
		x: 430,
		y: 100,
		type: 1
	}],
	[
	{
		x: 240,
		y: 80,
		type: 2
	}
	]
];