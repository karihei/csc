# CSC Visualization Monitor

とあるhekaから送られてきたとあるリクエストを可視化するツール。

限定的用途なので万人向けではないです。

## Installation

最新のNode.jsとnpmをインストールしておきましょう。

フレームワークにSailsを使用しているのでnpm経由でインストールしておきます。
```sh
$ sudo npm install -g sails
```

上手くいかない場合はNodeのバージョンを上げる。
```sh
$ sudo npm cache clean -f
$ sudo npm install -g n
$ sudo n stable
$ node -v
```

sailsをインストールしたらcscに入りおもむろに以下を実行
```sh
$ cd csc/
$ npm install
```

## How to run
```sh
$ sails lift --port 8080
```
or

```sh
$ node app.js
```

各種ファイルの場所などはSailsのドキュメントを見てください。


## For develop
###  APIを作る
あたらしくAPIを作る時は以下を実行します。
```
$ sails generate controller hoge index
```
このAPIは```http://localhost/hoge```と対応します。

hogeが叩かれた時の処理は``` api/controller/HogeController.js``` に実装していきます。

どんなふうに書けばいいのかは既存のControllerを参考にして下さい

### indexのviewをいじる
このへんをいじってください``` views/home/index.ejs ``` 

これは```http://localhost/ ``` にアクセスされた時に表示されます。

### クライアント側をいじる
```http://localhost/``` にアクセスされた際のクライアント側の基本的な実装は```assets/linker/js/client.js```に書いてます。

client.jsは``` views/home/index.ejs ``` から読み込まれます。


### 外部ライブラリを使いたい
サービス全体で使うものはすべて```assets/linker/[js|styles] ``` 以下にぶっ込んで下さい。

全てのページで自動で読み込まれます。

依存関係で読み込み順を制御したい場合はGruntfiles.js内のjsFilesToInjectあたりに優先順位を記述して下さい。
```javascript
var jsFilesToInject = [
   'linker/js/jquery.min.js',
   'linker/js/jquery.plugin.hoge.js',
   'linker/**/*.js'
];
```
