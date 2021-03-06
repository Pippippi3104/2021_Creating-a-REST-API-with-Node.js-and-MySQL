<a id="contents"></a>

## Contents

- [Google Cloud Run で動く Node.js アプリケーションを開発する](#sec01)
- [Creating a REST API with Node.js and MySQL](#sec02)

<a id="#sec01"></a>

## Google Cloud Run で動く Node.js アプリケーションを開発する

### ローカル開発環境で Node.js アプリケーションを作成する

- [HP](https://ishida-it.com/blog/post/2020-07-23-cloudrun-nodejs-1/)

- init
  - ```
    npm init -y
    npm i express
    mkdir public
    ```
  - npm i -D express だとデプロイエラーになる場合あり
- public/index.html ファイル作成

  - index.js

    - ```
      const express = require('express');
      const app = express();

      app.use(express.static(__dirname + '/public'));

      const port = process.env.PORT || 8080;
      app.listen(port, () => {
        console.log(`Listening on port ${port}.`);
      });

      app.get("/hello", async (req, res) => {
        const word = req.query.w;
        res.send(`Hello, you entered ${word}!`);
      });
      ```

  - public / index.html
    - ```
      <main>
        <form action="hello" method="GET">
          <label for="word">Please input a word or a phrase.</label>
          <input type="text" name="w" id="word" autofocus />
          <button type="submit">Submit</button>
        </form>
      </main>
      ```

- run
  - ```
    "scripts": {
        "start": "node index.js"
      },
    ```
  - ```
    npm start
    ```
- Links
  - [**dirname と**filename の使い方](https://qiita.com/mzmz__02/items/c132989cd0d0c2068832)

### アプリケーションをコンテナ化し、Cloud Run にデプロイする

- Dockerfile の作成
  - ```
    FROM node:12-slim
    WORKDIR /usr/src/app
    COPY package.json package*.json ./
    RUN npm install --only=production
    COPY . .
    CMD ["npm", "start"]
    ```
- デプロイ先プロジェクトの作成
  - Google Cloud Platform の管理画面上で新規作成
- Cloud Build によるビルド実行
  - gcloud コマンドがまだインストールされていない場合
    → [Google Cloud SDK のドキュメント](https://cloud.google.com/sdk/docs?hl=ja)
  - deploy.sh
    ```
    PROJECT_ID=cloudrun-words
    gcloud builds submit --tag=gcr.io/$PROJECT_ID/words-app --project=$PROJECT_ID
    ```
  - run
    - ```
      chmod +x deploy.sh
      gcloud auth login
      gcloud config set project cloudrun-words-317113
      ./deploy.sh
      ```
- ビルドされたコンテナイメージを Cloud Run にデプロイ
  - Cloud Run」を開き、「CREATE SERVICE」をクリック

### Git からの継続的デプロイを設定する

- Cloud Run のサービス詳細画面で「SET UP CONTINUOUS DEPLOYMENT」をクリック
  - CICD がうまくいかない時
    - トリガーの編集を再実施
      - Dockerfile のディレクトリ
        - /src/googlecloudrun
      - Dockerfile の名前
        - Dockerfile

### Cloud Translation API に接続する

- 「APIs & Services」から Cloud Translation API を検索して有効化
  - ```
    npm i @google-cloud/translate
    ```
- IAM からアカウント作成
  - name: words-app
  - その後、鍵の作成とダウンロード
- start.sh
  - ```
    export GOOGLE_APPLICATION_CREDENTIALS=/Users/satoshishimamurasecond/Desktop/SatoshiShimamura/60_Udemy/2021_Creating-a-REST-API-with-Node.js-and-MySQL/src/googlecloudrun/cloudrun-words-317113-03cb7288372e.json
    npm run start
    ```
  - ```
    chmod +x start.sh
    ./start.sh
    curl http://localhost:8080/translate/fr
    > Bonjour
    ```

### Cloud SQL 上の MySQL データベースに接続する

- MySQL インスタンスを作成
  - credentials
    - words-db
    - 111111111!Qq
  - MySQL のユーザを作成
    - アプリケーションからデータベースに接続するためのユーザを作成
      - words-user
      - 111111111!Qq
  - データベースを作成
    - Character set は「utf8mb4」、Collation は「utf8mb4_bin」
- データベースに接続

  - ローカル開発環境から接続するには、[Cloud SQL Proxy](https://cloud.google.com/sql/docs/mysql/sql-proxy?hl=ja) を使用
  - Cloud SQL Proxy のページから実行ファイルをダウンロードして任意のフォルダに保存

    - ※ mac 用のファイルをダウンロード
    - ```
      curl -o cloud_sql_proxy https://dl.google.com/cloudsql/cloud_sql_proxy.darwin.amd64
      chmod +x cloud_sql_proxy
      ```

      ```
      ./cloud_sql_proxy -instances=cloudrun-words-317113:us-central1:words-db=tcp:3306
      ```

    - 例)
      - /foo/bar/cloud_sql_proxy -instances=[プロジェクト ID]:[リージョン]:[SQL インスタンス ID]=tcp:3306
      - インスタンス接続 を使う

- テーブルを作成

  - db へ接続（GCP terminal）
  - ```
    gcloud sql connect words-db -u root
    ```
  - ```
    use words;
    show tables;

    CREATE TABLE `words`.`words` (
    `id` INT NOT NULL AUTO_INCREMENT,
    `ja` NVARCHAR(200) NOT NULL,
    `en` NVARCHAR(200) NOT NULL,
    `es` NVARCHAR(200) NOT NULL,
    `fr` NVARCHAR(200) NOT NULL,
    `done` TINYINT NOT NULL DEFAULT 0,
    PRIMARY KEY (`id`));

    INSERT INTO `words`.`words` (`ja`, `en`, `es`, `fr`, `done`) VALUES
    ('今日', 'today', 'hoy', "aujourd'hui", 0);
    INSERT INTO `words`.`words` (`ja`, `en`, `es`, `fr`, `done`) VALUES
    ('明日', 'tomorrow', 'mañana', "demain", 0);
    INSERT INTO `words`.`words` (`ja`, `en`, `es`, `fr`, `done`) VALUES
    ('自転車', 'bicycle', 'bicicleta', "vélo", 0);

    select * from words;
    ```

- ローカルで動く Node.js アプリケーションから Cloud SQL に接続する

  - ```
    npm i mysql knex
    ```
  - database.js

    - ```
      const Knex = require('knex');
      const connect = () => {
        const config = {
          user: process.env.DB_USER,
          password: process.env.DB_PASS,
          database: process.env.DB_NAME,
          host: process.env.DB_HOST,
          socketPath: process.env.DB_SOCKET,
        };

        return Knex({
          client: 'mysql',
          version: '5.7',
          connection: config,
        });
      };
      const knex = connect();
      module.exports = knex;
      ```

  - index.js で database.js をインポートし、単語一覧を返す API エンドポイントを作成

    - ```
      ...
      const knex = require('./database');
      ...

      // 単語一覧
      app.get('/words', async (req, res) => {
        const words = await knex.select('*').from('words').orderBy('id');
        res.json({ status: 'ok', data: [...words] });
      });
      ```

  - .env
    - ```
      GOOGLE_APPLICATION_CREDENTIALS=/xxx/xxxxxxxxxx.json
      DB_USER=xxxxxx (←作成したアカウント)
      DB_PASS=xxxxxx (←作成したアカウント)
      DB_NAME=words (←作成したテーブル名)
      DB_HOST=localhost
      DB_SOCKET=
      ```

- run

  - ```
    "scripts": {
      "dev": "node -r dotenv/config index.js",
      "start": "node src/index.js"
    },
    ```

  - ```
    npm i -D dotenv
    ./cloud_sql_proxy -instances=cloudrun-words-317113:us-central1:words-db=tcp:3306
    npm run dev
    ```
  - http://localhost:8080/words

- Cloud Run から Cloud SQL に接続する
  - Cloud Run 上で「EDIT & DEPLOY NEW REVISION」をクリック
    - DB_USER: words-user
      DB_PASS: 111111111!Qq
      DB_NAME: words
      DB_SOCKET: /cloudsql/cloudrun-words-317113:us-central1:words-db

#### [Return to Contents](#contents)

<a id="#sec02"></a>

## Creating a REST API with Node.js and MySQL

### Credentials

- Instance ID
  - barkbark
- password
  - 111111111!Qq

### Cloud Shell Terminal

- step 001: login

  - ```
    gcloud sql connect barkbark -u root
    ```
  - ctrl c: exit

- step 002: move
  - ```
    use dog_data;
    show tables;
    ```
- step 003: create
  - ```
    CREATE TABLE breeds (name varchar(30) UNIQUE, type varchar(30), lifeExpectancy INT, origin varchar(30));
    show tables;
    ```
- step 004: insert and select
  - ```
    INSERT INTO breeds VALUES ('poodle', 'sporting', 14, 'Germany');
    select * from breeds;
    ```

### Node

- step 001: init
  - ```
    npm init
    npm i -D express mysql
    ```
- step 002: server init

  - index.js
  - ```
    const express = require("express");
    const mysql = require("mysql");

    // app
    const app = express();

    // connect
    app.use(express.json());
    const port = process.env.PORT || 8080;
    app.listen(port, () => {
        console.log(`BarkBark Rest API listening on port ${port}`);
    });

    // API
    app.get("/", async (req, res) => {
        res.json({ status: "Bark bark! Ready to roll!" });
    });
    ```

  - ```
    npm run start (node index.js)
    curl localhost:8080
    ```

### connect to GCP

- create deploy.sh
- install
  - ```
    curl https://sdk.cloud.google.com | bash
    ```
  - シェル再起動必須
- run
  - ```
    chmod +x deploy.sh
    gcloud auth login
    gcloud config set project bark-bark-api-317105
    ./deploy.sh
    ```
- links
  - [Permission denied](https://qiita.com/sanstktkrsyhsk/items/ef88ddfb9fa8e7306e45)
  - [Mac に gcloud をインストールする](https://note.com/in_colors_net/n/n98ef81d6eb46)
  - [gcloud コマンドが認識されないとき（初心者向け）](https://qiita.com/jre233kei/items/355914b36e505152e29d)

### Links

- [Creating a REST API with Node.js and MySQL](https://www.youtube.com/watch?v=_w_idf928WY)

#### [Return to Contents](#contents)
