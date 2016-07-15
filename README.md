# node_logcat
logcatの結果をnode.jsからいじる

## Description

logcatにて"MEASURE:XXXXX; comment"というキーワード間の時間をus単位で計測・表示  

### sample format

#### input

以下の形式でログ出力するようにしておく

    MEASURE:TRANSITION; start

    MEASURE:TRANSITION; end

#### output

以下の形式でかかった時間(micro sec)を出力する

    time: XXX us TRANSITION

## Settings

ログ自体のフィルタをする場合は追加

    var filters = ['jp'];

時間計測のみで良い場合は以下をtrue

    var diffOnly = false;

## Usage

    $ npm i
    $ node logcat
