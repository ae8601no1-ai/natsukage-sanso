import type { Scene } from "./types";

export const endingTitles: Record<string,string>={END01:"触れてはいけない",END02:"六人目の足音",END03:"傷",END04:"帰れない",END05:"呪われた六人",END06:"見てはいけない写真",END07:"写真を消せ",END08:"管理人",END09:"追跡者",END10:"全員生還",END11:"犯人は藤堂",END12:"23時51分",END13:"空室",END14:"撮影者",END15:"存在しない人",END16:"七人目の夏"};
const end=(id:string,text:string,unlockEvidence:string[]=[],image?:string):Scene=>({id:id.toLowerCase(),time:"",image,speaker:"",text,ending:id,unlockEvidence,effect:id==="END15"?"glitch":undefined});

const baseScenes:Scene[]=[
  {id:"arrival",time:"AUGUST 14",speaker:"悠真・モノローグ",text:"大学最後の夏だった。\n\n佐久間が見つけてきた山奥の貸山荘で、\n\n一泊して、\n\nバーベキューをして、\n\nくだらない話をして。\n\nそれだけの旅行になるはずだった。",nextScene:"arrival_time"},
  {id:"arrival_time",time:"16:37",speaker:"悠真・モノローグ",text:"――あの夜。\n\n肝試しなんかしなければ。\n\nたぶん、\n\n何も起きなかった。",nextScene:"arrival_friends"},
  {id:"arrival_friends",time:"16:37",image:"lodge_arrival_1637",speaker:"佐久間／森川／美咲／小宮／藤堂",text:"「着いたー！」\n\n「遠すぎだろ。コンビニから何分走った？」\n\n「でも、いいじゃん。写真で見たより全然いい」\n\n「虫すごいけどね」\n\n「山に来て虫に文句言うなよ」\n\n「森川には言われたくない」\n\n「荷物、先に入れよう」",nextScene:"arrival_kuse"},
  {id:"arrival_kuse",time:"16:40",image:"lodge_arrival_1637",speaker:"久世 隆一",text:"「高瀬さんたちですね？」\n\n「管理人の久世です」\n\n「今日は皆さんだけですから、ゆっくりしてください」\n\n「一階がリビングとキッチン」\n\n「寝室は二階です」\n\n「何かあったら管理棟にいますから」",choices:[{label:"山荘について聞く",nextScene:"ask_lodge"},{label:"廃トンネルについて聞く",nextScene:"ask_tunnel",setFlags:["heard_tunnel_warning"]},{label:"特に聞かない",nextScene:"ask_nothing"}]},
  {id:"ask_lodge",time:"16:42",speaker:"悠真／久世",text:"「ここ、結構古いんですか？」\n\n「ええ。もうずいぶんになります」\n\n「昔はもっとお客さんも多かったんですけどね」\n\n「まあ、古いぶん不便なところもあります」\n\n「夜は足元に気をつけてください」",nextScene:"explore_intro"},
  {id:"ask_tunnel",time:"16:42",speaker:"悠真／久世／森川",text:"「この近くに古いトンネルがあるって聞いたんですけど」\n\n「……あそこですか」\n\n「やっぱりあるんだ」\n\n「若い人は行きたがるんですけどね」\n\n「夜は危ないから、行かない方がいいですよ」\n\n「危ないって、崩れるとか？」\n\n「道も悪いですし、街灯もありません」\n\n「何かあってからじゃ遅いですから」",nextScene:"explore_intro"},
  {id:"ask_nothing",time:"16:42",speaker:"悠真／久世",text:"「分かりました」\n\n「では、ごゆっくり」",nextScene:"explore_intro"},
  {id:"explore_intro",time:"16:50",speaker:"佐久間／美咲",text:"「BBQまでまだ時間あるな」\n\n「中、見て回ろうよ」",choices:[{label:"リビング",nextScene:"explore_living",unlockEvidence:["seen_7_cups"]},{label:"キッチン",nextScene:"explore_kitchen",unlockEvidence:["receipt_partial"]},{label:"二階",nextScene:"explore_roomd",unlockEvidence:["room_d_seen","unknown_charger"]},{label:"駐車場",nextScene:"explore_parking",unlockEvidence:["kuse_car_seen"]},{label:"荷物置場",nextScene:"explore_bags",unlockEvidence:["unknown_bag_seen"]}]},
  {id:"explore_living",time:"16:55",speaker:"悠真／森川／小宮",text:"「結構広いな」\n\n「夜になったら雰囲気ありそう」\n\n「やめてよ」",nextScene:"photo_setup"},
  {id:"explore_kitchen",time:"16:56",speaker:"悠真／佐久間",text:"「買いすぎじゃないか？」\n\n「余るくらいでちょうどいいんだよ」\n\n「これ、誰か財布に入れとけよ」\n\n「あとでいいって」",nextScene:"photo_setup"},
  {id:"explore_roomd",time:"16:57",speaker:"悠真／美咲",text:"「Dは誰も使わないんだっけ」\n\n「……？」\n\n「どうしたの？」\n\n「いや」\n\n「前の客の忘れ物かな」\n\n「管理人さんにあとで言っとけば？」\n\n「そうだな」",nextScene:"photo_setup"},
  {id:"explore_parking",time:"16:58",speaker:"佐久間／悠真",text:"「あれ、管理人さんのかな」\n\n「たぶん」\n\n「山じゃこういう車が便利なんだろうな」",nextScene:"photo_setup"},
  {id:"explore_bags",time:"16:59",speaker:"悠真／森川",text:"「……これ誰のだ？」\n\n「悠真ー！　肉どこ入れたー？」\n\n「知らねえよ！」",nextScene:"photo_setup"},
  {id:"photo_setup",time:"17:18",image:"group_1718",speaker:"美咲／佐久間",text:"「せっかくだから写真撮ろうよ」\n\n「いいね」",nextScene:"photo_question"},
  {id:"photo_question",time:"IMG_0814_171842.jpg",image:"group_1718",speaker:"",text:"高瀬悠真\n佐久間亮\n森川拓海\n水野美咲\n小宮彩香\n藤堂圭介",choices:[{label:"写真を見る",nextScene:"photo_look",unlockEvidence:["group_photo_saved"]},{label:"美咲に送ってもらう",nextScene:"photo_send",unlockEvidence:["group_photo_saved"]},{label:"気にしない",nextScene:"bbq"}]},
  {id:"photo_look",time:"17:18",image:"group_1718",speaker:"悠真／美咲／藤堂",text:"「まあまあじゃん」\n\n「藤堂、顔固すぎ」\n\n「いつもこんな顔」",nextScene:"bbq"},
  {id:"photo_send",time:"17:18",image:"group_1718",speaker:"悠真／美咲",text:"「それ、俺にも送って」\n\n「グループに入れとく」",nextScene:"bbq"},
  {id:"bbq",time:"18:05",speaker:"佐久間／全員／森川／小宮",text:"「乾杯！」\n\n「乾杯！」\n\n「大学最後の夏だからな」\n\n「まだ卒業できるって決まってないでしょ」\n\n「それ今言う？」",nextScene:"bbq_memory"},
  {id:"bbq_memory",time:"18:05",speaker:"悠真・モノローグ",text:"この時のことは、よく覚えている。\n\n肉が少し焦げていたこと。\n\n森川がくだらない話ばかりしていたこと。\n\n美咲が何枚も写真を撮っていたこと。\n\nみんなが笑っていたこと。\n\n――少なくとも。\n\n俺はそう覚えている。",choices:[{label:"次へ",nextScene:"test_proposal"},{label:"誰もいない席を見る",nextScene:"empty_seat",conditions:[{canUnlockEnd15:true}]}]},
  {id:"test_proposal",time:"20:42",speaker:"森川／小宮／佐久間／美咲／藤堂",text:"「ということで」\n\n「行こうぜ」\n\n「何が『ということで』なの」\n\n「廃トンネル」\n\n「マジで行くの？」\n\n「ここまで来て行かない理由ある？」\n\n「あるよ。危ないから」\n\n「ちょっとだけなら面白そう」\n\n「久世さん、行くなって言ってたけど」\n\n「管理人ならそう言うって」",choices:[{label:"行く",nextScene:"night_road"},{label:"行かない",nextScene:"murder_stay"},{label:"まだ決めない",nextScene:"night_road",conditions:[{state:"loopCount",equals:true}]}]},
  {id:"night_road",time:"21:36",speaker:"小宮／森川／佐久間／美咲／藤堂",text:"「ほんとに行くの？」\n\n「もうここまで来たんだから」\n\n「足元気をつけろよ」\n\n「待って、写真撮る」\n\n「……雨、来るかも」",nextScene:"night_monologue"},
  {id:"night_monologue",time:"21:36",speaker:"悠真・モノローグ",text:"あの時。\n\n引き返していれば。\n\n何度そう考えたか分からない。",nextScene:"tunnel"},
  {id:"tunnel",time:"22:02",speaker:"森川／小宮",text:"「……あった」\n\n「帰ろう」\n\n「ここまで来たのに？」",choices:[{label:"森川を追う",nextScene:"shrine"},{label:"林の光を見る",nextScene:"forest_light"},{label:"山荘へ戻る",nextScene:"escape_car"}]},
  {id:"shrine",time:"22:02",speaker:"小宮／森川",text:"「森川、やめなよ」\n\n「触るだけだって」",choices:[{label:"止める",nextScene:"wound_appears"},{label:"止めない",nextScene:"shrine_touch"},{label:"祠を撮影する",nextScene:"forest_light"}]},
  {id:"shrine_touch",time:"22:03",speaker:"森川／佐久間／小宮",text:"「……。」\n\n「どう？」\n\n「何もない」\n\n「ほらな」\n\n「帰ろう」",nextScene:"lodge_knock"},
  {id:"lodge_knock",time:"23:10",speaker:"美咲／藤堂／佐久間／森川／小宮",text:"「停電？」\n\n「ブレーカーかな」\n\nドン。\n\nドン。\n\nドン。\n\n「……誰だよ」\n\n「久世さんじゃない？」\n\n「だったら名前言うでしょ」",choices:[{label:"玄関を開ける",nextScene:"end01"},{label:"開けない",nextScene:"seven_steps"},{label:"二階へ逃げる",nextScene:"roomd_night"}]},
  {id:"seven_steps",time:"",speaker:"美咲／悠真",text:"「……ねえ」\n\n「何？」\n\n「誰か、後ろ歩いてない？」\n\n一つ。\n\n二つ。\n\n三つ。\n\n四つ。\n\n五つ。\n\n六つ。\n\n――七つ。",choices:[{label:"人数を数える",nextScene:"end02"},{label:"振り返る",nextScene:"end05"},{label:"外へ走る",nextScene:"escape_car"}]},
  {id:"roomd_night",time:"",speaker:"悠真／小宮",text:"「ちょっと待って」\n\n「人数、確認しよう」\n\n「……六人」\n\n「あそこ、誰も使ってないよね？」",choices:[{label:"ベッドを見る",nextScene:"end02"},{label:"充電ケーブルを見る",nextScene:"end02",unlockEvidence:["unknown_charger"]},{label:"逃げる",nextScene:"end05"}]},
  {id:"wound_appears",time:"",speaker:"悠真／森川／美咲",text:"「やめとけ」\n\n「何だよ」\n\n「管理人も言ってただろ」\n\n「ビビりすぎ」\n\n「悠真」\n\n「ん？」\n\n「腕」\n\n「……あれ？」\n\n「いつ切ったんだよ」\n\n「枝か何かじゃない？」",choices:[{label:"傷を見る",nextScene:"end03"},{label:"気にしない",nextScene:"escape_car"}]},
  {id:"escape_car",time:"",speaker:"佐久間／藤堂／美咲／小宮／悠真",text:"「なんでだよ」\n\n「歩くしかない」\n\n「……嘘」\n\n「戻ってきた？」\n\n「……車」",choices:[{label:"徒歩で下山",nextScene:"end04"},{label:"山荘へ戻る",nextScene:"end05"}]},
  {id:"forest_light",time:"22:27",image:"crime_2231",speaker:"悠真／美咲",text:"「あれ……」\n\n「何？」\n\n「向こう」",choices:[{label:"遠くから撮影する",nextScene:"crime_photo"},{label:"近づく",nextScene:"kuse_notice"},{label:"みんなに知らせる",nextScene:"kuse_notice"}]},
  {id:"crime_photo",time:"22:31",image:"crime_2231",speaker:"美咲／悠真",text:"「……これ」\n\n「人？」\n\n「拡大して」",choices:[{label:"拡大する",nextScene:"end06"},{label:"削除する",nextScene:"end07"},{label:"山荘へ戻る",nextScene:"invasion"}]},
  {id:"kuse_notice",time:"22:35",image:"crime_2231",speaker:"男／美咲",text:"「……！」\n\n「逃げて！」\n\n「待ってくれ！」\n\n「違うんだ！」",nextScene:"invasion"},
  {id:"invasion",time:"23:21",speaker:"小宮／悠真",text:"「写真消して！」\n\n「でも――」\n\n「それが欲しいんでしょ！」",choices:[{label:"スマホを隠す",nextScene:"end08",unlockEvidence:["kuse_car_seen"]},{label:"写真を削除",nextScene:"end07"},{label:"外へ逃げる",nextScene:"chase"}]},
  {id:"chase",time:"",speaker:"UNKNOWN／悠真",text:"写真を返してくれ\n\n誰も傷つけるつもりはない\n\n「……何なんだよ」",choices:[{label:"返信する",nextScene:"reply_unknown",unlockEvidence:["unknown_messages"]},{label:"スマホを捨てる",nextScene:"end09",unlockEvidence:["unknown_messages"]},{label:"警察へ電話する",nextScene:"end10",unlockEvidence:["survival_record"]}]},
  {id:"reply_unknown",time:"",speaker:"悠真・入力／UNKNOWN／悠真",text:"あなたは誰ですか\n\n写真だけ返してくれ\n\nそれで終わる\n\n「信用できるかよ……」",nextScene:"end09"},
  {id:"murder_stay",time:"22:15",speaker:"悠真／小宮／森川／佐久間",text:"「俺はやめとく」\n\n「私も」\n\n「つまんねーの」\n\n「雨も降りそうだしな」",nextScene:"body_found"},
  {id:"body_found",time:"23:34",speaker:"美咲／小宮／悠真／藤堂／森川／悠真・モノローグ",text:"「佐久間、どこ行った？」\n\n「さっき二階にいた」\n\nドン。\n\n「亮！」\n\n「触らないで！」\n\n「佐久間！」\n\n「……死んでる」\n\n「嘘だろ」\n\nこの山荘にいるのは、\n\n俺たちだけ。\n\nなら。\n\n佐久間を殺したのは――\n\nここにいる誰かだ。",nextScene:"murder_investigation"},
  {id:"murder_investigation",time:"",speaker:"システム",text:"3か所調査してください。",choices:[{label:"藤堂が犯人だ",nextScene:"end11"},{label:"佐久間のスマートフォン",nextScene:"message_2351"},{label:"空室D",nextScene:"unknown_room"},{label:"集合写真再検証",nextScene:"photographer_question",conditions:[{ending:"END02"}]},{label:"集合写真再検証",nextScene:"photographer_question",conditions:[{ending:"END13"}]}]},
  {id:"message_2351",time:"23:51",speaker:"佐久間のスマートフォン／悠真／小宮／藤堂／森川",text:"お前ら、まだ外？\n\n「……待って」\n\n「どうしたの？」\n\n「佐久間が死んだのは？」\n\n「23時48分頃」\n\n「じゃあ、誰が送った？」\n\n一人足りない。",nextScene:"end12"},
  {id:"unknown_room",time:"",speaker:"悠真／小宮／美咲",text:"「これ……」\n\n「誰の？」\n\nA—— N——\n\n「私たちのじゃないよね」\n\n「……。」",nextScene:"end13"},
  {id:"photographer_question",time:"IMG_0814_171842_HQ.jpg",image:"group_1718_hq",speaker:"美咲／悠真",text:"「……悠真」\n\n「何？」\n\n「この写真」\n\n「佐久間」\n\n「森川」\n\n「私」\n\n「彩香」\n\n「藤堂」\n\n「悠真」\n\n「それが？」\n\n「これ」\n\n「誰が撮ったの？」",nextScene:"end14"},
  {id:"empty_seat",time:"18:05",speaker:"悠真／佐久間／森川",text:"「……。」\n\n「どうした？」\n\n「ここ」\n\n「誰か座ってなかったか？」\n\n「は？」\n\n「いや……」\n\n「誰か……」\n\n「飲みすぎじゃね？」",nextScene:"unknown_phone",unlockEvidence:["seen_7_cups","receipt_partial"]},
  {id:"unknown_phone",time:"02:17",speaker:"UNKNOWN／悠真",text:"「……誰のだ？」\n\n忘れたの？\n\n「……？」\n\n俺もいたよ。\n\n「誰だ……？」\n\n悠真。\n\n「……なんで」\n\n「俺の名前を……」\n\nPARTICIPANTS：6\n\nPARTICIPANTS：7\n\nDATA CORRUPTED",nextScene:"end15",effect:"glitch"},
  end("END01","森川は見つからなかった。\n\n俺たちは山を下りた。\n\n警察にも話した。\n\n何度も捜索が行われた。\n\nそれでも。\n\n森川は戻らなかった。\n\n「……森川？」"),
  end("END02","「……誰か」\n\n「ここにいた？」",["room_d_seen"]),
  end("END03","「結構深いな……」\n\nPHOTO TIME：20:11\n\nROUTE EVENT：22:14\n\nTIMESTAMP CONFLICT",["timeline_conflict_wound"]),
  end("END04","「……嘘」\n\n「戻ってきた？」\n\n「……車」",["kuse_car_seen"]),
  end("END05","誰もいなくなった。\n\n理由も分からなかった。\n\n何が起きたのかも。\n\n俺だけが、\n\n山荘を出た。\n\n「……ごめん」"),
  end("END06","「……こっち見てる」",[],"crime_2231"),
  end("END07","「大変でしたね」\n\n「でも」\n\n「皆さん無事でよかった」\n\n「……はい」\n\nCLOUD SYNC COMPLETE",["unknown_messages"],"crime_2231"),
  end("END08","「高瀬さん！」\n\n「久世さん！？」\n\n「こっちです」\n\n「管理棟へ行きましょう」\n\n「分かりました」\n\n「まず安全な場所へ」\n\n「麓まで送ります」\n\n「ありがとうございます」\n\n「どうしました？」\n\n「……いえ」",["kuse_car_seen"]),
  end("END09","すまない",["unknown_messages"]),
  end("END10","「終わったな」\n\n「……うん」\n\n全員、\n\n生きて帰ることができた。\n\nSURVIVORS：6\n\nPARTICIPANTS：7",["survival_record"]),
  end("END11","「俺じゃない！」\n\n「朝までそこにいろ！」\n\n「……そんな」\n\n「何があった？」"),
  end("END12","一人足りない。",["unknown_messages"]),
  end("END13","A—— N——\n\n「私たちのじゃないよね」\n\n「……。」",["room_d_seen","unknown_bag_seen","unknown_charger","damaged_name_tag"]),
  end("END14","「これ」\n\n「誰が撮ったの？」",["group_photo_hq"],"group_1718_hq"),
  end("END15","PARTICIPANTS：6\n\nPARTICIPANTS：7\n\nDATA CORRUPTED",["seen_7_cups","receipt_partial"]),
  {id:"investigation_restored",time:"AUGUST 14 / 17:23",image:"true_end",speaker:"悠真",text:"「……。」\n\n「いた」\n\n「直樹……」\n\n「最初から」\n\n「ここにいた」\n\nPARTICIPANTS：7\n\nRECORD RESTORATION COMPLETE",nextScene:"true_arrival",effect:"glitch"},
  {id:"true_arrival",time:"16:37",image:"lodge_arrival_1637",speaker:"直樹／悠真",text:"「おい悠真、荷物持てよ」\n\n「お前のカメラバッグだろ」\n\n「高いんだから丁寧に」\n\n「だったら自分で持て」\n\n「親友だろ？」\n\n「こういう時だけな」",nextScene:"true_room"},
  {id:"true_room",time:"16:52",speaker:"",text:"寝室D。直樹がバッグを置く。\n\n充電ケーブルを差す。\n\nペットボトルをベッド横へ。\n\nこれまでの「怪異」が一つずつ普通の出来事へ戻っていく。",nextScene:"true_photo18"},
  {id:"true_photo18",time:"17:18",image:"group_1718",speaker:"直樹／美咲／悠真",text:"「並べ並べ」\n\n「ちゃんと撮ってよ」\n\n「俺を誰だと思ってる」\n\n「素人」\n\n「帰れ」",nextScene:"true_photo23"},
  {id:"true_photo23",time:"17:23",image:"true_end",speaker:"久世／直樹／森川／悠真",text:"「撮りましょうか？」\n\n「あ、いいんですか？」\n\n「もう少し寄って」\n\n「悠真、狭い」\n\n「お前が寄ってんだよ」\n\n「撮りますよ」",nextScene:"true_bbq"},
  {id:"true_bbq",time:"18:05",speaker:"美咲／直樹／悠真・現在の声",text:"「直樹、また撮ってる」\n\n「あとで絶対見たくなるって」\n\n「じゃあ私も撮る」\n\n「俺はいいって」\n\n「撮る側だけ逃げるのずるい」\n\nだから、\n\n写真にあいつが少なかった。\n\nいなかったんじゃない。\n\nずっと、\n\n撮る側にいたんだ。",nextScene:"true_light"},
  {id:"true_light",time:"22:27",speaker:"直樹／悠真／美咲",text:"「待って」\n\n「どうした？」\n\n「あそこ、明かり」\n\n「行くの？」\n\n「ちょっと見るだけ」",nextScene:"true_crime"},
  {id:"true_crime",time:"22:31",image:"crime_2231",speaker:"直樹／悠真",text:"「……人、倒れてない？」\n\n「戻ろう」\n\n「待って」",nextScene:"true_detected"},
  {id:"true_detected",time:"22:35",image:"crime_2231",speaker:"直樹／久世",text:"「……血」\n\n「……！」\n\n「走れ！」\n\n「待ってくれ！」\n\n「違うんだ！」",nextScene:"true_wound"},
  {id:"true_wound",time:"22:51",speaker:"悠真／直樹",text:"「っ……！」\n\n「悠真！」\n\n「いいから行け！」",nextScene:"true_review"},
  {id:"true_review",time:"23:08",speaker:"直樹／佐久間／小宮／藤堂／美咲",text:"「撮った」\n\n「何を？」\n\n「さっきの」\n\n「顔も写ってる」\n\n「警察」\n\n「圏外」\n\n「二階なら入るかも」",nextScene:"true_outside"},
  {id:"true_outside",time:"23:18",speaker:"小宮／森川／直樹／悠真",text:"「……いる」\n\n「追ってきた」\n\n「スマホだ」\n\n「何？」\n\n「あいつが欲しいの、これだ」",nextScene:"true_leave"},
  {id:"true_leave",time:"23:43",speaker:"直樹／悠真",text:"「あいつが欲しいのは俺のスマホだ」\n\n「だから何だよ」\n\n「俺が持ってる限り、ここに来る」\n\n「待てよ」\n\n「電波入るところまで行く」\n\n「一人で？」\n\n「みんなで動いたら目立つ」\n\n「直樹！」",nextScene:"true_road"},
  {id:"true_road",time:"23:49",speaker:"悠真／直樹",text:"「直樹！」\n\n「なんで来たんだよ！」\n\n「一人で行かせられるか！」\n\n「来た」\n\n「こっち！」",nextScene:"true_bridge"},
  {id:"true_bridge",time:"23:54—23:56",image:"bridge",speaker:"直樹／悠真／仲間の声",text:"「これ渡るのか？」\n\n「向こうの道なら下へ出られる！」\n\n「悠真！」\n\n「直樹！」\n\n「直樹！」\n\n「悠真！」\n\n「逃げろ！」\n\n「でも直樹が！」\n\n「来るぞ！」",nextScene:"true_present"},
  {id:"true_present",time:"現在",speaker:"悠真",text:"「……ここまでだ」\n\n「この先はない」\n\n「直樹はここで死んだ」\n\n「俺が橋に連れていった」\n\n「落ちたのに」\n\n「俺は……」\n\n「置いて逃げた」\n\n「だから何度もやり直した」",nextScene:"true_terminated"},
  {id:"true_terminated",time:"RECONSTRUCTION TERMINATED",speaker:"悠真",text:"「トンネルに行かなかったら」\n\n「写真を撮らなかったら」\n\n「山荘から逃げていたら」\n\n「誰か別の奴が犯人だったら」\n\n「呪いだったら」\n\n「俺のせいじゃなかったら」\n\n「どこかに」\n\n「直樹が死なない選択肢があると思った」",nextScene:"unread_notice"},
  {id:"unread_notice",time:"ARCHIVE / UNREAD：1",speaker:"",text:"UNKNOWN FILE\n\nNAOKI_0815_0612.jpg",choices:[{label:"開く",nextScene:"unread_0612"}],effect:"unread"},
  {id:"unread_0612",time:"06:12",image:"naoki_0612",speaker:"",text:"NAOKI_0815_0612.jpg",nextScene:"final_gate",unlockEvidence:["naoki_0612_photo"],setFlags:["naoki_0612_unlocked"],effect:"unread"},
  {id:"final_gate",time:"06:12",image:"naoki_0612",speaker:"",text:"NAOKI_0815_0612.jpg",unlockEvidence:["kuse_vehicle_match","final_audio"]},
  {id:"final_truth",time:"06:25",speaker:"直樹／久世",text:"「……助かった」\n\n「……久世さん」\n\n「……生きてたのか」\n\n「乗れ」\n\n「病院まで送る」\n\n「……警察に行きます」\n\n「分かってる」\n\n「写真も残ってます」\n\n「君には分からない」\n\n「ここしか」\n\n「俺には残ってないんだ」\n\n「だからって」\n\n「人を消していい理由にはならない」\n\nFINAL RECORD RESTORED",nextScene:"kuse_context"},
  {id:"kuse_context",time:"",speaker:"悠真・モノローグ",text:"大槻宗一郎。\n\nこの山の地主。\n\n山には開発計画があった。\n\n大槻は土地を売るつもりだった。\n\n久世は反対していた。\n\nあの夜。\n\n二人は山で会った。\n\n――そして揉み合いになった。",nextScene:"kuse_choice"},
  {id:"kuse_choice",time:"",speaker:"悠真・モノローグ",text:"最初から殺すつもりだったわけじゃない。\n\n事故だった。\n\nそこで警察を呼んでいれば。\n\nそこで全部話していれば。\n\nまだ戻れた。\n\nでも久世は、\n\n一つ目の間違いを隠すために、\n\n次の間違いを選んだ。",nextScene:"yuma_decision"},
  {id:"yuma_decision",time:"現在",speaker:"悠真",text:"「俺も同じだった」\n\n「怖かった」\n\n「橋の下に直樹がいたのに」\n\n「逃げた」\n\n「でも」\n\n「そんな8月14日は」\n\n「一度もなかった」\n\n「あなたが見つけた」\n\n「俺が消した直樹を」\n\n「俺が見なかった続きを」\n\n「だから」\n\n「今度は逃げない」",nextScene:"evidence_package"},
  {id:"evidence_package",time:"EVIDENCE PACKAGE COMPLETE",speaker:"悠真",text:"「警察に持っていく」\n\n「大槻さんのことも」\n\n「直樹のことも」\n\n「全部」\n\n「今度こそ」\n\n「最後まで」",nextScene:"finish_prompt_old"},
  {id:"finish_prompt_old",time:"",speaker:"",text:"8月14日を再度開始しますか？",nextScene:"finish_prompt",effect:"glitch"},
  {id:"finish_prompt",time:"",image:"true_end",speaker:"",text:"8月14日を終了しますか？",choices:[{label:"終了する",nextScene:"end16"}]},
  {id:"end16",time:"AUGUST 14 / 17:23",image:"true_end",speaker:"悠真",text:"「ずっと」\n\n「違う結末を探してた」\n\n「あの夜を変えられると思ってた」\n\n「でも」\n\n「変えるんじゃなかった」\n\n「なかったことにするんじゃなかった」\n\n「忘れちゃいけなかったんだ」\n\n「直樹」\n\n「今度こそ」\n\n「ちゃんと覚えてる」",ending:"END16"},
];

const speakerSequences: Record<string, string[]> = {
  arrival_friends:["佐久間","森川","美咲","小宮","森川","小宮","藤堂"], arrival_kuse:["久世","久世","久世","久世","久世","久世"],
  ask_lodge:["悠真","久世","久世","久世","久世"], ask_tunnel:["悠真","久世","森川","久世","久世","森川","久世","久世"], ask_nothing:["悠真","久世"],
  explore_intro:["佐久間","美咲"], explore_living:["悠真","森川","小宮"], explore_kitchen:["悠真","佐久間","悠真","佐久間"],
  explore_roomd:["悠真","悠真","美咲","悠真","悠真","美咲","悠真"], explore_parking:["佐久間","悠真","佐久間"], explore_bags:["悠真","森川・遠くから","悠真"],
  photo_setup:["美咲","佐久間"], photo_look:["悠真","美咲","藤堂"], photo_send:["悠真","美咲"], bbq:["佐久間","佐久間","森川","小宮","森川"],
  test_proposal:["森川","森川","小宮","森川","佐久間","森川","小宮","美咲","藤堂","森川"], night_road:["小宮","森川","佐久間","美咲","藤堂"],
  tunnel:["森川","小宮","森川"], shrine:["小宮","森川"], shrine_touch:["悠真","佐久間","森川","森川","小宮"], lodge_knock:["美咲","藤堂","佐久間","森川","小宮"],
  seven_steps:["美咲","悠真","美咲"], roomd_night:["悠真","悠真","悠真","小宮"], wound_appears:["悠真","森川","悠真","森川","美咲","悠真","美咲","悠真","森川","悠真"],
  escape_car:["佐久間","藤堂","美咲","小宮","悠真"], forest_light:["悠真","悠真","悠真"], crime_photo:["美咲","悠真","美咲"], kuse_notice:["男","美咲","男","男"],
  invasion:["小宮","悠真","小宮"], chase:["悠真"], reply_unknown:["悠真"], murder_stay:["悠真","小宮","森川","佐久間"],
  body_found:["美咲","藤堂","美咲","小宮","悠真","藤堂","森川"], message_2351:["悠真","美咲","悠真","藤堂","森川"], unknown_room:["悠真","小宮","美咲","悠真"],
  photographer_question:["美咲","悠真","美咲","美咲","美咲","美咲","美咲","悠真","美咲","悠真","美咲","美咲"], empty_seat:["悠真","佐久間","悠真","悠真","佐久間","悠真","悠真","森川"],
  unknown_phone:["悠真","悠真","悠真","悠真","悠真"], end01:["悠真"], end02:["悠真","悠真"], end03:["悠真"], end04:["美咲","小宮","悠真"], end05:["悠真・モノローグ"],
  end06:["悠真"], end07:["久世","久世","久世","悠真"], end08:["久世","悠真","久世","久世","悠真","久世","久世","悠真","久世","悠真"], end10:["佐久間","美咲"],
  end11:["藤堂","森川","小宮","藤堂"], end13:["美咲","悠真"], end14:["美咲","美咲"], investigation_restored:["悠真","悠真","悠真","悠真","悠真"],
  true_arrival:["直樹","悠真","直樹","悠真","直樹","悠真"], true_photo18:["直樹","美咲","直樹","悠真","直樹"], true_photo23:["久世","直樹","久世","森川","悠真","久世"],
  true_bbq:["美咲","直樹","美咲","直樹","美咲"], true_light:["直樹","悠真","直樹","美咲","直樹"], true_crime:["直樹","悠真","直樹"],
  true_detected:["直樹","久世","直樹","久世","久世"], true_wound:["悠真","直樹","悠真"], true_review:["直樹","悠真","直樹","直樹","小宮","藤堂","美咲"],
  true_outside:["小宮","森川","直樹","悠真","直樹"], true_leave:["直樹","悠真","直樹","悠真","直樹","悠真","直樹","悠真"], true_road:["悠真","直樹","悠真","直樹","悠真"],
  true_bridge:["直樹","悠真","直樹","悠真","悠真","直樹","仲間の声","悠真","仲間"], true_present:Array(8).fill("悠真"), true_terminated:Array(8).fill("悠真"),
  final_truth:["直樹","直樹","久世","久世","久世","直樹","久世","直樹","久世","久世","久世","直樹","直樹"], yuma_decision:Array(12).fill("悠真"),
  evidence_package:Array(6).fill("悠真"), end16:Array(10).fill("悠真")
};

function addNamesToDialogue(scene: Scene): Scene {
  if (!scene.speaker || scene.speaker === "システム") return scene;

  const blocks = scene.text.split("\n\n");
  const dialogueIndexes = blocks.flatMap((block, index) => block.trimStart().startsWith("「") ? [index] : []);
  if (!dialogueIndexes.length) return scene;

  const names = speakerSequences[scene.id] ?? scene.speaker.split("／");
  const exactSequence = names.length === dialogueIndexes.length;
  let dialogueIndex = 0;
  const text = blocks.map((block, index) => {
    if (!dialogueIndexes.includes(index)) return block;
    const name = names.length === 1 ? names[0] : exactSequence ? names[dialogueIndex] : scene.speaker;
    dialogueIndex += 1;
    return `【${name}】\n${block}`;
  }).join("\n\n");

  return { ...scene, speaker: "", text };
}

export const scenes = baseScenes.map(addNamesToDialogue);
export const sceneMap=Object.fromEntries(scenes.map(scene=>[scene.id,scene]));
