# 圖解運動擴充查核：高齡與神經 9 篇

> 發布狀態更新（2026-09-28）：以下保留研究草擬階段的查核紀錄與當時待審狀態。完成整合預覽後，使用者明確回覆「可以上線」；本批文章已改為網站內容負責人確認（approved），確認日期為 2026-09-28。未宣稱由具名醫師審閱。


查閱日期：2026-09-28。對應檔案：`lib/exercise-guides-curated-neuro.ts`。

## 任務問題、範圍與審閱狀態

協助長者、神經疾病患者與家屬辨認運動研究實際適用的族群、需要的專業支持、可期待的結果及無法推論的部分。選用對臨床決策有價值的原始隨機試驗，包含陰性與不利結果；不是以正向結果或期刊名氣判定品質。

本子任務依主代理分工新增 9 篇，未修改既有已審閱正文。每篇約 960–1,050 個中文字、四格研究方案、完整原始文獻引用及安全情境。所有新增資料均設 `reviewStatus: pending`，日期 `2026-09-28`，沒有聲稱已通過醫師審閱。依專案工作流程第 13 節，研究結論、禁忌、紅旗與應用判斷仍需醫師或合格內容負責人確認後發布。

本檔未取得 Search Console 或 GA4 的前 28/56 天資料，不虛構搜尋量、排名或轉換基準。使用者指定擴充數量，此批屬有證據支撐的內容探索；量測與全站檢查由主代理統一記錄。此處不聲稱已改善 SEO 或健康結果，也不新增追蹤事件。

## 查核方法與界線

- 先閱讀本專案 `AGENTS.md` 及 `CAM-SAVANT-SEO-CONTENT-WORKFLOW.md`。
- 逐篇核對作者、完整題名、期刊、年份卷期頁碼、DOI、研究族群、樣本數、對照、介入劑量、主要結果及限制。
- 直接閱讀 JAMA、BMJ 或 PMC 原文方法／結果；部分 PubMed、PMC 頁面出現機器驗證時，以 Europe PMC 公開 API 取得原文作者摘要再次核實，而非僅依搜尋結果片段。使用的 API：`https://www.ebi.ac.uk/europepmc/webservices/rest/search?query=EXT_ID:{PMID}&format=json&resultType=core`。
- LEAPS 另讀 PMC 搜尋回傳的原文長文，並以 Europe PMC 的正式摘要核對所使用的劑量與結論。AVERT、Park-in-Shape 的頁面讀取受限，透過 Europe PMC 讀取正式摘要後，只保留摘要確實支持的數字；不聲稱讀過其完整附件。
- 原始 RCT 不自動等於高確定性證據。選文品質理由包括規模、隨機配置、盲化結局評估、明確臨床結局與可解讀的對照；沒有自行給予未做完整偏差風險評估的 GRADE 等級。
- 劑量均標為「研究安排」，不是個人醫囑。四格是本站原創示意，非論文原圖，也沒有聲稱這四格自身經試驗驗證。居家支持、監督及不同研究組別未被省略。
- `cue`、`regression`、`signals` 及部分 `followUp` 為待專業審閱的保守應用與安全溝通文字，不冒充原試驗逐字操作手冊、獨立驗證的演算法或處方。不額外編造安全心率、疼痛分數、組次或恢復時限。

## 1. LIFE：高齡行動能力

ID：`life-mobility-disability-rct`

原始文獻：Pahor M, Guralnik JM, Ambrosius WT, et al. Effect of Structured Physical Activity on Prevention of Major Mobility Disability in Older Adults: The LIFE Study Randomized Clinical Trial. JAMA. 2014;311(23):2387–2396. DOI: 10.1001/jama.2014.5616.

來源：[JAMA 全文](https://jamanetwork.com/journals/jama/fullarticle/1875328)、[PubMed 24866862](https://pubmed.ncbi.nlm.nih.gov/24866862/)。已讀摘要、Interventions 及結果。核對日期：2026-09-28。

選入原因：1,635 人、八中心隨機試驗，盲化評估者，主要結局是能否完成 400 公尺步行，平均追蹤 2.6 年；直接回答高齡功能下降者如何維持行動能力。

已核對：70–89 歲、活動量少、SPPB 不高於 9 分但仍能走 400 公尺；中心每週 2 次及居家 3–4 次；步行目標每週 150 分鐘、單日逐步至 30 分鐘，另約 10 分鐘下肢肌力（踝部負重，2 組 × 10 次）及 10 分鐘平衡與柔軟度。主要失能 30.1% 對 35.5%，HR 0.82（0.69–0.98）。

解讀限制：健康教育組也有伸展；為整套計畫效果，不能歸因單一動作。原本無法行走、重度認知障礙、急性住院等情境不能直接外推。本文沒有將目標總量當起始量，也沒有將嚴重不良事件的無顯著差異寫成零風險。

## 2. SPRINTT：衰弱與肌少症

ID：`sprintt-frailty-mobility-rct`

原始文獻：Bernabei R, Landi F, Calvani R, et al. Multicomponent intervention to prevent mobility disability in frail older adults: randomised controlled trial (SPRINTT project). BMJ. 2022;377:e068788. DOI: 10.1136/bmj-2021-068788.

來源：[BMJ](https://www.bmj.com/content/377/bmj-2021-068788)、[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC9092831/)。已讀 Participants、Interventions、Primary outcome、Statistical analysis 及 Discussion。核對日期：2026-09-28。

選入原因：1,519 人、評估者盲化、多中心 RCT，預設主要族群與探索族群，觀察具臨床意義的行動失能。為身體衰弱及肌少症提供與 LIFE 不同的組合介入證據。

已核對：70 歲以上、低四肢瘦體組織量、SPPB 3–9 分且尚能完成 400 公尺；中心每週 2 次，居家從每週 1 次漸增至最多 4 次，最長 36 個月。結合有氧、肌力、平衡、柔軟度、活動回饋與營養諮詢。步行 Borg 6–20 分量表約 13，下肢肌力約 15–16。主要分析 SPPB 3–7 分共 1,205 人：46.8% 對 52.7%，HR 0.78（0.67–0.92）。主要事件也計入死亡，已在正文補明。

解讀限制：SPPB 8–9 分未見相同主要結局效益，不能說所有肌少症族群均受益。不能分離運動、營養及行為支持效果。雖原文列出營養攝取目標，正文未把它轉成人人適用的飲食處方。

## 3. 治療性太極防跌

ID：`taijiquan-falls-prevention-rct`

原始文獻：Li F, Harmer P, Fitzgerald K, et al. Effectiveness of a Therapeutic Tai Ji Quan Intervention vs a Multimodal Exercise Intervention to Prevent Falls Among Older Adults at High Risk of Falling: A Randomized Clinical Trial. JAMA Intern Med. 2018;178(10):1301–1310. DOI: 10.1001/jamainternmed.2018.3915.

來源：[JAMA Internal Medicine 全文](https://jamanetwork.com/journals/jamainternalmedicine/fullarticle/2701631)、[PMC 書目](https://pmc.ncbi.nlm.nih.gov/articles/PMC6233748/)。已讀受試者、介入、結果表及利益揭露。核對日期：2026-09-28。

選入原因：670 人、三組主動介入比較、盲化評估者；跌倒是直接臨床結局。相較只與不運動比較，更能協助選擇防跌課程。

已核對：70 歲以上、過去跌倒／行動受限社區成人；太極 224 人、多模式 223 人、伸展 223 人。每週 2 次、60 分鐘、24 週。TJQMBB 為八式改編與治療性活動，含重心轉移、單側承重、軀幹骨盆轉動、眼頭手協調。總跌倒次數 152、218、363；相較伸展 IRR 0.42，相較多模式 IRR 0.69。

解讀限制：事件率並非每位參與者風險降低百分比。Oregon 地區、白人比例高、跌倒自我回報。主要作者揭露課程授權費相關利益，已保留。原文確有分期課堂組次，正文刻意不將之轉成通用「每日單動作處方」，也不把任意太極影片說成同樣有效。

## 4. DAPA：失智症的陰性結果

ID：`dapa-dementia-exercise-rct`

原始文獻：Lamb SE, Sheehan B, Atherton N, et al. Dementia And Physical Activity (DAPA) trial of moderate to high intensity exercise training for people with dementia: randomised controlled trial. BMJ. 2018;361:k1675. DOI: 10.1136/bmj.k1675.

來源：[PMC 全文](https://pmc.ncbi.nlm.nih.gov/articles/PMC5953238/)、[BMJ 原刊](https://www.bmj.com/content/361/bmj.k1675)。已讀完整摘要、Study treatments、Outcomes、Results 與 Discussion。核對日期：2026-09-28。

選入原因：494 人多中心實務型 RCT，2:1 配置、盲化結局評估；對「運動能治療失智認知退化」提供重要反證，避免僅精選正向小試驗。

已核對：329 人運動、165 人通常照護，輕至中度失智症、能自行坐椅與走約 3 公尺。監督課每週 2 次、60–90 分鐘、4 個月；固定車 5 分鐘暖身及最多 25 分鐘中等至高強度活動，搭配個別化上肢啞鈴、坐站肌力。另鼓勵每週 1 小時居家活動。12 個月 ADAS-cog 未改善，運動組稍差且臨床意義未確定；其他臨床結局未顯示受益。

關鍵校正：6 週 6 分鐘步行變化只在運動組測量，不能把組內改善當作隨機組間體能療效。正文因此明確區分兩者。本文介紹研究，並未推薦以同樣高負荷治療失智症；也未由陰性結果推論所有運動都無價值。

## 5. LEAPS：中風步行方案比較

ID：`leaps-stroke-walking-rct`

原始文獻：Duncan PW, Sullivan KJ, Behrman AL, et al. Body-Weight–Supported Treadmill Rehabilitation after Stroke. N Engl J Med. 2011;364(21):2026–2036. DOI: 10.1056/NEJMoa1010790.

來源：[NEJM 原刊](https://www.nejm.org/doi/abs/10.1056/NEJMoa1010790)、[PMC 原文](https://pmc.ncbi.nlm.nih.gov/articles/PMC3175688/)、[PubMed 21612471](https://pubmed.ncbi.nlm.nih.gov/21612471/)。NEJM 可讀研究身份與方法；PMC 搜尋擷取返回原文多節；另外透過 Europe PMC core API 直接取得完整正式摘要核實主要宣稱。核對日期：2026-09-28。

選入原因：408 人多中心 RCT，直接比較設備密集與居家治療師方案，有一年功能性步行結局，能避免把昂貴設備視作必然更有效。

已核對：中風後約 2 個月分組；減重跑步機組在中風後約 2 或 6 個月啟動，居家漸進肌力與平衡組在約 2 個月啟動。各組預定 36 次、每次 90 分鐘、12–16 週。52% 在一年時提升功能性步行等級，兩種時機的減重方案均未優於居家方案。減重方案中暈眩或將昏倒較多；嚴重行走障礙者早期減重組反覆跌倒較多。

解讀限制：研究中介入是完整課程，90 分鐘不是連續跑步機時間。各組仍接受通常復健且用量不同；沒有不治療對照，不可推論復健無效。四格第 4 格明確是「另一條路徑」，避免誤畫成所有人需依序執行。未證明優越不是證明等效。

## 6. AVERT：急性中風極早期高劑量活動

ID：`avert-early-stroke-mobilisation-rct`

原始文獻：AVERT Trial Collaboration group. Efficacy and safety of very early mobilisation within 24 h of stroke onset (AVERT): a randomised controlled trial. Lancet. 2015;386(9988):46–55. DOI: 10.1016/S0140-6736(15)60690-0.

來源：[PubMed 25892679](https://pubmed.ncbi.nlm.nih.gov/25892679/)、[原刊正式摘要](https://www.sciencedirect.com/science/article/pii/S0140673615606900)。頁面讀取部分受限，已透過 Europe PMC core API 直接讀完整正式摘要；PubMed 記載 2015、2017 年勘誤，未把未查證的舊劑量細節納入。核對日期：2026-09-28。

選入原因：五國 56 病房、2,104 人 RCT、99% 三個月追蹤率，具有重要傷害警示，能糾正「復健越早越多越好」的錯誤類推。

已核對：高劑量極早期活動 1,054 人、通常病房照護 1,050 人。24 小時內活動比例為 92% 對 59%；三個月功能良好 mRS 0–2 為 46% 對 50%，調整 OR 0.73（0.59–0.90）。死亡為 8% 對 7%，差異未達統計顯著，正文沒有宣稱死亡顯著增加。

解讀與安全界線：時機、頻率及總量同時不同，不能分離個別成分，不支持所有早期活動皆有害，亦不能訂人人相同的最佳下床時點。本篇 `medical-team`；四格僅為團隊確認資格、安排姿位、個別決定活動與監測再評估，不提供重現有害高劑量方案的教學。家屬不可用圖解自行提前下床或擅自取消全部活動。

## 7. ICARE：中風上肢任務導向訓練

ID：`icare-stroke-arm-training-rct`

原始文獻：Winstein CJ, Wolf SL, Dromerick AW, et al. Effect of a Task-Oriented Rehabilitation Program on Upper Extremity Recovery Following Motor Stroke: The ICARE Randomized Clinical Trial. JAMA. 2016;315(6):571–581. DOI: 10.1001/jama.2016.0276.

來源：[JAMA 全文](https://jamanetwork.com/journals/jama/fullarticle/2488308)、[PubMed 26864411](https://pubmed.ncbi.nlm.nih.gov/26864411/)。已讀方法、分組、Treatment Interventions 及結論。核對日期：2026-09-28。

選入原因：第三期、361 人、多中心 RCT，盲化結局評估，包含同劑量通常治療對照，有助分開理解課程內容與時數。

已核對：中風後 14–106 天、主要中度上肢運動障礙，仍有最低限度手／手指主動伸展。ASAP 119 人、同劑量通常治療 120 人、未指定劑量通常照護 122 人。ASAP 預定 30 次一小時，每週 3 次約 10 週，研究允許於分組後 16 週內完成。課程強調有目的、患者選擇、共同問題解決與生活運用。12 個月主要 WMFT 結局未顯示優於另外兩組。

解讀限制：通常照護組不是沒治療，沒有證明所有劑量等效。不可由陰性結論推論不需職能治療；結論限於納入的障礙程度及時期。拿取物品是本站代表性例子，不聲稱是原試驗所有人的固定動作。健側限制手套在原研究可用但非強制，正文不鼓勵自行限制健手。

## 8. SPARX：第二期巴金森氏症運動試驗

ID：`sparx-parkinson-treadmill-rct`

原始文獻：Schenkman M, Moore CG, Kohrt WM, et al. Effect of High-Intensity Treadmill Exercise on Motor Symptoms in Patients With De Novo Parkinson Disease: A Phase 2 Randomized Clinical Trial. JAMA Neurol. 2018;75(2):219–226. DOI: 10.1001/jamaneurol.2017.3517.

來源：[JAMA Neurology 全文](https://jamanetwork.com/journals/jamaneurology/fullarticle/2664948)。已讀摘要、參與者、Exercise Interventions、統計設計與討論。核對日期：2026-09-28。

選入原因：第二期多中心隨機、盲化評估，處理強度可行性與後續試驗價值。保留它是為解釋研究成熟度，沒有僅憑期刊或 RCT 標籤升格為確證療效。

已核對：128 人、40–80 歲、早期未用藥，Hoehn–Yahr 1–2、診斷不超過 5 年。高強度 43、中強度 45、通常照護 40。實測最大心率 80%–85%／60%–65%；預定每週 4 天、26 週，暖身 5–10 分、主訓練 30 分、緩和 5–10 分，前 8 週漸增。前兩週現場監督、此後至少每月追蹤；高強度實際平均每週 2.8 天。UPDRS 動作改變 0.3 對通常照護 3.2 分，高強度符合進一步研究的非無效性標準。

解讀限制：phase 2 futility 設計不是確證疾病修飾試驗；不能聲稱已防止神經退化、可停藥或適用晚期患者。原論文使用實測最大心率，正文不換成年齡公式。藥物與病情變化須由團隊處理。

## 9. Park-in-Shape：居家固定車

ID：`park-in-shape-cycling-rct`

原始文獻：van der Kolk NM, de Vries NM, Kessels RPC, et al. Effectiveness of home-based and remotely supervised aerobic exercise in Parkinson's disease: a double-blind, randomised controlled trial. Lancet Neurol. 2019;18(11):998–1008. DOI: 10.1016/S1474-4422(19)30285-6.

來源：[PubMed 31521532](https://pubmed.ncbi.nlm.nih.gov/31521532/)。PubMed／Lancet 直接開頁部分受限，已透過 Europe PMC core API 直接讀正式完整摘要及書目，非僅依搜尋片段。核對日期：2026-09-28。

選入原因：130 人隨機試驗，主動伸展對照、相同支持工具與遠距監督，125 人（96%）具主要追蹤數據；可回答居家支持下有氧活動的價值。

已核對：30–75 歲、輕度（Hoehn–Yahr ≤2），固定車及伸展各 65 人；每週 3 次、30–45 分鐘、6 個月，兩組均有動機 app 與遠距支持。離藥狀態 MDS-UPDRS 運動結果組間差 4.2 分（95% CI 1.6–6.9）有利有氧。20 人未完成分配課程，兩組各 10 人；不是所有參與者都順利完成。

解讀限制：單中心、輕度族群、半年追蹤。研究稱雙盲，但參與者只不知道另一組內容，知道自己練的活動；正文澄清此點。離藥測驗是研究評估安排，不是叫患者日常運動前停藥。未取得可直接核對的完整強度附件，所以不填心率、轉速及阻力數字。未宣稱確證長期或疾病修飾效果。

## 本子任務的驗證

- 可由 `node --import tsx` 匯入資料檔；已確認 9 個不重複 ID、每篇 4 steps、中文字數約 960–1,050。
- 主代理負責圖解生成、整合、全站醫療審閱閘門及全站 lint／內容／build 檢查；本子任務未修改圖檔或共用檔案。
- 完成後需再次核對圖片文字與最終 `steps` 一致，以及 pending 內容未被誤標為已審閱。
