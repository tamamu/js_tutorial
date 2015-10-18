/*
	敵の弾の動きのデータです
	弾生成時に何かデータを受け取りたい時には引数optionを取らせます
	optionの中身は連想配列として，敵の行動パターンでfireする時に渡します

	structは弾の生成時に実行される初期化関数です
	弾のデータの初期値を代入します

	updateは弾の移動関数です
*/

var BulletType = {
	straight: {
		struct:function(){
			this.spd=5;
		},
		update:function(){
			this.dy+=this.spd;
		}
	},
	radiation: {
		struct:function(option){
			this.spd=3;
			this.angle=option.gap + Math.PI/25 * option.id;
		},
		update:function(){
			this.dx-=Math.cos(this.angle)*this.spd;
			this.dy-=Math.sin(this.angle)*this.spd;
		}
	},
	track: {
		struct:function(option){
			this.spd=5;
			var deltaX=option.enemy.x-player.x;
			var deltaY=option.enemy.y-player.y;
			this.angle=Math.atan2(deltaY, deltaX);
		},
		update:function(){
			this.dx-=Math.cos(this.angle)*this.spd;
			this.dy-=Math.sin(this.angle)*this.spd;
		}
	}
};

function EnemyBulletBase(type){
	this.x=0;
	this.y=0;
	this.dx=0;
	this.dy=0;
	this.spd=0;
	this.angle=0;
	this.update=BulletType[type].update;
	this.init=BulletType[type].struct;
}