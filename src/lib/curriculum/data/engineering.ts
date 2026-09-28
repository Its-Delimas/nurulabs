/**
 * Illustrative datasets for the Data Engineering track. Generated — not real
 * customers, agents or SACCO members.
 */

/**
 * A flat export of 1,500 mobile-money transactions in 2024, the way many
 * systems hand data over: customer and agent details repeated on every row,
 * phone numbers in three formats, some names in capitals, and one agent
 * renamed mid-year.
 */
export const MM_EXPORT_CSV = `tx_id,timestamp,customer_name,customer_phone,customer_county,agent_code,agent_name,agent_town,type,amount_ksh
TX00001,2024-01-01 02:05,James Chebet,0783445203,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,1240
TX00002,2024-01-01 13:02,Daniel Kiprop,0798585568,Nairobi,AG008,Likoni Agency,Likoni,send,2200
TX00003,2024-01-01 13:24,George Wanjiku,0745870866,Nairobi,AG001,Kibera Agency,Kibera,deposit,2710
TX00004,2024-01-01 20:52,Faith Chebet,+254770855361,Kakamega,AG010,Mumias Agency,Mumias,send,3080
TX00005,2024-01-02 06:24,Kevin Odhiambo,0724934058,Mombasa,AG005,Ahero Traders,Ahero,deposit,1450
TX00006,2024-01-02 15:38,Yusuf Otieno,0747751577,Nyeri,AG011,Karatina Traders,Karatina,withdrawal,860
TX00007,2024-01-03 02:46,Lucy Otieno,0782207908,Kakamega,AG010,Mumias Agency,Mumias,deposit,4990
TX00008,2024-01-03 09:02,Peter Kiprop,0723642023,Nyeri,AG011,Karatina Traders,Karatina,deposit,1850
TX00009,2024-01-03 13:30,Irene Otieno,0775963806,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1780
TX00010,2024-01-03 22:19,RUTH KAMAU,0755338137,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,1620
TX00011,2024-01-04 04:49,Ruth Mutua,0749753097,Mombasa,AG006,Naivasha Electronics,Naivasha,withdrawal,7510
TX00012,2024-01-04 08:37,Irene Achieng,+254728828887,Kisumu,AG004,Kondele Traders,Kondele,deposit,1110
TX00013,2024-01-04 12:58,Peter Mutua,+254758527453,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,3640
TX00014,2024-01-04 15:03,Ruth Wafula,0717982346,Nyeri,AG011,Karatina Traders,Karatina,deposit,1420
TX00015,2024-01-04 15:21,Wanjiru Nyambura,0710343706,Kisumu,AG004,Kondele Traders,Kondele,deposit,930
TX00016,2024-01-04 16:58,Hassan Wafula,254789447302,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,1810
TX00017,2024-01-05 11:14,Brian Ali,0777540098,Mombasa,AG004,Kondele Traders,Kondele,withdrawal,610
TX00018,2024-01-05 14:47,Wanjiru Kariuki,0713702236,Nyeri,AG011,Karatina Traders,Karatina,withdrawal,800
TX00019,2024-01-05 15:04,Tabitha Nyambura,0723654616,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,2180
TX00020,2024-01-05 16:27,Zawadi Ali,254738550009,Nairobi,AG005,Ahero Traders,Ahero,send,2440
TX00021,2024-01-05 16:48,Achieng Kamau,0715656728,Nyeri,AG011,Karatina Traders,Karatina,send,710
TX00022,2024-01-06 13:09,Samuel Wanjiku,0776897241,Kisumu,AG005,Ahero Traders,Ahero,deposit,3200
TX00023,2024-01-06 14:04,Victor Mutua,+254794959393,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,6150
TX00024,2024-01-06 14:06,Esther Ali,254717258033,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,3140
TX00025,2024-01-07 12:48,Otieno Odhiambo,0785741278,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,3680
TX00026,2024-01-07 20:20,Wanjiru Ali,0717521064,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,340
TX00027,2024-01-07 21:48,Wanjiru Mwangi,+254739166890,Kisumu,AG010,Mumias Agency,Mumias,withdrawal,3220
TX00028,2024-01-08 02:32,Daniel Kiprop,0798585568,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1640
TX00029,2024-01-08 03:08,Otieno Otieno,+254714603379,Mombasa,AG012,Othaya Mobile Shop,Othaya,send,4360
TX00030,2024-01-08 15:26,James Achieng,0724507260,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,950
TX00031,2024-01-08 15:27,Tabitha Otieno,0787970492,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,3630
TX00032,2024-01-08 16:48,Samuel Njoroge,0758932135,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2130
TX00033,2024-01-09 01:50,Otieno Ali,0796532173,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,2150
TX00034,2024-01-09 04:04,Wanjiru Kariuki,0713702236,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,1760
TX00035,2024-01-09 04:22,George Wafula,254745274138,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1740
TX00036,2024-01-11 11:37,Daniel Kiprop,0798585568,Nairobi,AG003,CBD Traders,CBD,withdrawal,2120
TX00037,2024-01-11 23:56,Mercy Nyambura,254747913516,Kisumu,AG011,Karatina Traders,Karatina,deposit,1370
TX00038,2024-01-12 00:43,Tabitha Odhiambo,254722804395,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,980
TX00039,2024-01-12 02:50,Tabitha Mutua,254756826189,Nakuru,AG006,Naivasha Electronics,Naivasha,send,1240
TX00040,2024-01-12 14:45,Duncan Achieng,254757533891,Kisumu,AG005,Ahero Traders,Ahero,deposit,2180
TX00041,2024-01-12 18:01,Ruth Kiprop,+254717570364,Nairobi,AG010,Mumias Agency,Mumias,withdrawal,1880
TX00042,2024-01-12 18:17,Otieno Odhiambo,0785741278,Kakamega,AG010,Mumias Agency,Mumias,deposit,1850
TX00043,2024-01-12 18:42,Yusuf Achieng,+254718327276,Nairobi,AG003,CBD Traders,CBD,deposit,2940
TX00044,2024-01-12 19:31,RUTH KAMAU,0755338137,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,540
TX00045,2024-01-13 08:50,Samuel Chebet,0781181137,Nairobi,AG003,CBD Traders,CBD,deposit,660
TX00046,2024-01-13 15:14,Faith Chebet,0765596236,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1240
TX00047,2024-01-14 00:29,Wanjiru Kiprop,+254730762633,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,5680
TX00048,2024-01-14 00:57,Brian Ali,0777540098,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,6640
TX00049,2024-01-14 18:14,Peter Mutua,0728142270,Kisumu,AG001,Kibera Agency,Kibera,deposit,4220
TX00050,2024-01-15 09:12,Victor Nyambura,0782470004,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,4700
TX00051,2024-01-15 09:25,Samuel Omondi,+254773701385,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2070
TX00052,2024-01-16 10:11,RUTH KIPROP,0717570364,Nairobi,AG009,Changamwe Electronics,Changamwe,deposit,1260
TX00053,2024-01-16 23:22,Otieno Njoroge,0792922794,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1430
TX00054,2024-01-17 07:10,Njeri Kiprop,0752888749,Kakamega,AG010,Mumias Agency,Mumias,deposit,6050
TX00055,2024-01-17 13:48,Emmanuel Omondi,0725380344,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,600
TX00056,2024-01-17 15:50,Yusuf Omondi,0738858153,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,1980
TX00057,2024-01-18 01:08,Samuel Chebet,0781181137,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,1320
TX00058,2024-01-18 09:14,Tabitha Wanjiku,+254791654489,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,940
TX00059,2024-01-18 14:12,Tabitha Mutua,0756826189,Nakuru,AG010,Mumias Agency,Mumias,deposit,3950
TX00060,2024-01-18 23:02,Brian Chebet,0724749319,Kisumu,AG005,Ahero Traders,Ahero,deposit,7850
TX00061,2024-01-19 02:46,Amina Kariuki,0780857257,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1840
TX00062,2024-01-20 03:01,Zawadi Odhiambo,0715527223,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,3220
TX00063,2024-01-20 05:10,George Omondi,0738982885,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,4470
TX00064,2024-01-20 05:33,Ruth Mutua,+254765990081,Nyeri,AG011,Karatina Traders,Karatina,send,1220
TX00065,2024-01-20 07:27,Irene Achieng,0728828887,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,510
TX00066,2024-01-20 21:00,Quincy Kiprop,0767945672,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1930
TX00067,2024-01-21 04:41,Njeri Odhiambo,254761137549,Nakuru,AG006,Naivasha Electronics,Naivasha,send,840
TX00068,2024-01-21 13:21,Ruth Kiprop,+254781162841,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,390
TX00069,2024-01-21 13:24,James Chebet,0783445203,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,500
TX00070,2024-01-21 14:51,Tabitha Otieno,0768320549,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,1670
TX00071,2024-01-21 23:22,Otieno Kiprop,+254794761775,Kisumu,AG009,Changamwe Electronics,Changamwe,withdrawal,1790
TX00072,2024-01-22 03:44,Lucy Otieno,0782207908,Kakamega,AG010,Mumias Agency,Mumias,deposit,930
TX00073,2024-01-22 07:23,Ruth Mutua,254749753097,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1630
TX00074,2024-01-22 12:01,Faith Chebet,+254765596236,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,2180
TX00075,2024-01-22 16:38,Faith Odhiambo,+254788298499,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,2230
TX00076,2024-01-22 18:24,Tabitha Ali,254714969608,Nyeri,AG011,Karatina Traders,Karatina,send,770
TX00077,2024-01-22 18:55,Samuel Ali,254735580256,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2860
TX00078,2024-01-22 20:08,James Omondi,+254766457955,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,3240
TX00079,2024-01-22 21:58,Brian Chebet,+254724749319,Kisumu,AG005,Ahero Traders,Ahero,deposit,6920
TX00080,2024-01-23 04:31,Cynthia Otieno,+254798918869,Mombasa,AG002,Githurai Mobile Shop,Githurai,send,2220
TX00081,2024-01-23 10:00,James Omondi,0766457955,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,2860
TX00082,2024-01-23 13:27,Brian Chebet,0735785667,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,1360
TX00083,2024-01-23 23:55,Amina Ali,0751100442,Nakuru,AG007,Molo Mobile Shop,Molo,send,3810
TX00084,2024-01-24 20:53,Yusuf Otieno,0747751577,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,4850
TX00085,2024-01-24 22:17,George Wafula,0745274138,Mombasa,AG008,Likoni Agency,Likoni,deposit,1430
TX00086,2024-01-25 06:00,Kevin Odhiambo,0793945277,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1560
TX00087,2024-01-25 08:02,Hassan Wafula,254789447302,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,1120
TX00088,2024-01-25 10:23,Duncan Omondi,0761565061,Kisumu,AG005,Ahero Traders,Ahero,send,1400
TX00089,2024-01-25 12:05,Samuel Wanjiku,0776897241,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2900
TX00090,2024-01-25 19:28,Yusuf Achieng,0718327276,Nairobi,AG003,CBD Traders,CBD,withdrawal,1250
TX00091,2024-01-26 02:41,Otieno Mutua,0793658336,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1490
TX00092,2024-01-26 09:56,Emmanuel Omondi,0725380344,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,2830
TX00093,2024-01-26 15:06,Yusuf Achieng,0718327276,Nairobi,AG012,Othaya Mobile Shop,Othaya,deposit,1240
TX00094,2024-01-27 02:48,Esther Ali,0778898676,Nairobi,AG003,CBD Traders,CBD,deposit,5060
TX00095,2024-01-27 16:11,Esther Ali,0778898676,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,4470
TX00096,2024-01-27 16:31,Brian Ali,0758236176,Nairobi,AG001,Kibera Agency,Kibera,deposit,4750
TX00097,2024-01-27 19:03,James Kiprop,0743585965,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,630
TX00098,2024-01-27 21:07,Cynthia Njoroge,0742670375,Nairobi,AG003,CBD Traders,CBD,send,1250
TX00099,2024-01-27 21:51,Njeri Odhiambo,0761137549,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,1230
TX00100,2024-01-28 05:23,OTIENO OTIENO,0714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,380
TX00101,2024-01-28 05:44,Tabitha Otieno,254787970492,Kakamega,AG010,Mumias Agency,Mumias,deposit,570
TX00102,2024-01-28 12:40,Quincy Mutua,0796494933,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1170
TX00103,2024-01-28 13:05,Wanjiru Mwangi,0739166890,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,3240
TX00104,2024-01-29 11:30,Kevin Nyambura,0768987947,Kisumu,AG005,Ahero Traders,Ahero,deposit,1510
TX00105,2024-01-29 21:20,Lucy Mwangi,0738773451,Kakamega,AG010,Mumias Agency,Mumias,deposit,4720
TX00106,2024-01-30 05:25,Tabitha Omondi,254799935367,Kakamega,AG010,Mumias Agency,Mumias,deposit,910
TX00107,2024-01-30 07:47,Irene Otieno,0775963806,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,8790
TX00108,2024-01-30 08:02,AMINA OMONDI,0734657335,Nyeri,AG011,Karatina Traders,Karatina,withdrawal,1170
TX00109,2024-01-30 08:02,Achieng Njoroge,0770692216,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,970
TX00110,2024-01-30 14:17,Chebet Kamau,254774759708,Kisumu,AG004,Kondele Traders,Kondele,deposit,4020
TX00111,2024-01-30 14:39,Amina Kariuki,0780857257,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,1250
TX00112,2024-01-30 15:09,Quincy Mutua,0796494933,Nairobi,AG009,Changamwe Electronics,Changamwe,send,2450
TX00113,2024-01-30 21:45,Samuel Wanjiku,0757133398,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,1700
TX00114,2024-01-31 04:31,Peter Mutua,0728142270,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,950
TX00115,2024-01-31 05:56,Faith Wanjiku,0781461966,Kakamega,AG010,Mumias Agency,Mumias,deposit,4710
TX00116,2024-01-31 06:07,Kevin Kamau,0786124492,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,3320
TX00117,2024-01-31 06:52,Emmanuel Mutua,0777249423,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,310
TX00118,2024-01-31 22:14,Ruth Mutua,0765990081,Nyeri,AG004,Kondele Traders,Kondele,send,1860
TX00119,2024-01-31 22:37,OTIENO ODHIAMBO,254785741278,Kakamega,AG001,Kibera Agency,Kibera,send,2290
TX00120,2024-01-31 23:36,James Chebet,0783445203,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1900
TX00121,2024-02-01 01:18,Peter Wafula,0741815015,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,370
TX00122,2024-02-01 01:38,George Omondi,0738982885,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,3460
TX00123,2024-02-01 05:54,Yusuf Achieng,0718327276,Nairobi,AG001,Kibera Agency,Kibera,send,2190
TX00124,2024-02-02 02:38,Tabitha Wanjiku,0791654489,Nairobi,AG001,Kibera Agency,Kibera,deposit,490
TX00125,2024-02-02 04:08,Samuel Omondi,0773701385,Kisumu,AG012,Othaya Mobile Shop,Othaya,deposit,1080
TX00126,2024-02-02 04:10,Wanjiru Nyambura,0710343706,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1630
TX00127,2024-02-02 06:03,Otieno Kiprop,254794761775,Kisumu,AG004,Kondele Traders,Kondele,deposit,580
TX00128,2024-02-02 15:27,Otieno Njoroge,0792922794,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2950
TX00129,2024-02-02 21:34,Brian Ali,0758236176,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,1000
TX00130,2024-02-02 21:44,Esther Chebet,0732335804,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2640
TX00131,2024-02-03 11:07,Amina Omondi,0730800514,Kisumu,AG004,Kondele Traders,Kondele,send,3520
TX00132,2024-02-03 15:19,Yusuf Otieno,0747751577,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,1630
TX00133,2024-02-03 17:38,Njeri Odhiambo,0761137549,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1880
TX00134,2024-02-03 18:40,Lucy Nyambura,+254783896326,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1140
TX00135,2024-02-04 07:34,James Mutua,254745468032,Kakamega,AG010,Mumias Agency,Mumias,deposit,1620
TX00136,2024-02-04 13:56,Umi Odhiambo,0789104220,Kisumu,AG004,Kondele Traders,Kondele,deposit,600
TX00137,2024-02-05 02:18,Esther Ali,0778898676,Nairobi,AG001,Kibera Agency,Kibera,send,2620
TX00138,2024-02-05 06:24,Otieno Otieno,0714603379,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,3210
TX00139,2024-02-06 05:49,Otieno Kiprop,0794761775,Kisumu,AG004,Kondele Traders,Kondele,send,2480
TX00140,2024-02-06 06:06,Mercy Nyambura,0747913516,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,680
TX00141,2024-02-06 12:33,Ruth Kamau,+254755338137,Mombasa,AG007,Molo Mobile Shop,Molo,deposit,5060
TX00142,2024-02-06 14:40,Brian Ali,+254758236176,Nairobi,AG001,Kibera Agency,Kibera,send,860
TX00143,2024-02-06 20:15,Esther Achieng,0778860702,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,390
TX00144,2024-02-06 23:38,OTIENO OTIENO,0714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,4730
TX00145,2024-02-07 01:17,Yusuf Njoroge,0781698656,Mombasa,AG002,Githurai Mobile Shop,Githurai,deposit,1170
TX00146,2024-02-07 03:45,Esther Ali,0778898676,Nairobi,AG003,CBD Traders,CBD,deposit,770
TX00147,2024-02-07 05:14,Mercy Kiprop,0768729052,Kakamega,AG010,Mumias Agency,Mumias,deposit,770
TX00148,2024-02-07 06:27,NJERI ODHIAMBO,0761137549,Nakuru,AG010,Mumias Agency,Mumias,deposit,860
TX00149,2024-02-07 15:56,Wanjiru Nyambura,254710343706,Kisumu,AG004,Kondele Traders,Kondele,send,1430
TX00150,2024-02-07 22:26,Amina Omondi,254734657335,Nyeri,AG011,Karatina Traders,Karatina,deposit,1610
TX00151,2024-02-08 01:45,Tabitha Nyambura,0723654616,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,3110
TX00152,2024-02-08 07:07,Esther Achieng,0778860702,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1010
TX00153,2024-02-08 08:32,Lucy Nyambura,0783896326,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,580
TX00154,2024-02-08 13:37,Cynthia Kamau,0746618936,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,280
TX00155,2024-02-09 03:31,Tabitha Mutua,0756826189,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1030
TX00156,2024-02-09 10:47,Daniel Kamau,+254757110322,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,690
TX00157,2024-02-09 21:53,Umi Odhiambo,+254789104220,Kisumu,AG001,Kibera Agency,Kibera,deposit,2040
TX00158,2024-02-09 22:07,Umi Odhiambo,0789104220,Kisumu,AG004,Kondele Traders,Kondele,send,1840
TX00159,2024-02-10 00:43,Otieno Otieno,0714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1280
TX00160,2024-02-10 02:01,Ruth Kamau,+254755338137,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,2040
TX00161,2024-02-10 03:30,Samuel Wanjiku,0776897241,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2100
TX00162,2024-02-10 10:38,Yusuf Njoroge,0781698656,Mombasa,AG008,Likoni Agency,Likoni,deposit,4630
TX00163,2024-02-10 14:35,Wanjiru Kiprop,0730762633,Nairobi,AG001,Kibera Agency,Kibera,send,1420
TX00164,2024-02-10 16:14,Victor Nyambura,+254792481430,Kakamega,AG010,Mumias Agency,Mumias,deposit,6070
TX00165,2024-02-11 04:07,LUCY MUTUA,+254753343892,Nairobi,AG001,Kibera Agency,Kibera,deposit,720
TX00166,2024-02-11 06:40,George Kariuki,0779950911,Kisumu,AG005,Ahero Traders,Ahero,deposit,1210
TX00167,2024-02-11 14:35,James Achieng,+254724507260,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,4830
TX00168,2024-02-12 05:19,Amina Ali,+254751100442,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,2600
TX00169,2024-02-12 06:23,James Chebet,0783445203,Nairobi,AG001,Kibera Agency,Kibera,deposit,1250
TX00170,2024-02-12 20:17,VICTOR MUTUA,0794959393,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1610
TX00171,2024-02-13 16:36,James Kiprop,254743585965,Nakuru,AG012,Othaya Mobile Shop,Othaya,send,2900
TX00172,2024-02-13 22:41,Yusuf Achieng,0718327276,Nairobi,AG001,Kibera Agency,Kibera,deposit,4310
TX00173,2024-02-14 02:00,KEVIN ODHIAMBO,+254798234176,Kakamega,AG007,Molo Mobile Shop,Molo,withdrawal,1940
TX00174,2024-02-14 04:18,Tabitha Wanjiku,+254791654489,Nairobi,AG001,Kibera Agency,Kibera,deposit,4540
TX00175,2024-02-14 06:46,Esther Omondi,0721708124,Nyeri,AG002,Githurai Mobile Shop,Githurai,withdrawal,3610
TX00176,2024-02-14 19:18,Peter Wafula,0741815015,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,420
TX00177,2024-02-16 04:47,Mercy Kiprop,0768729052,Kakamega,AG010,Mumias Agency,Mumias,send,2970
TX00178,2024-02-16 06:47,OTIENO ODHIAMBO,254748664970,Nairobi,AG003,CBD Traders,CBD,deposit,1480
TX00179,2024-02-16 06:52,James Omondi,0766457955,Nairobi,AG001,Kibera Agency,Kibera,deposit,4140
TX00180,2024-02-16 13:41,James Achieng,+254724507260,Nakuru,AG007,Molo Mobile Shop,Molo,send,460
TX00181,2024-02-16 14:09,Wanjiru Ali,+254717521064,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,560
TX00182,2024-02-16 20:24,Zawadi Omondi,0732701953,Kakamega,AG010,Mumias Agency,Mumias,deposit,1520
TX00183,2024-02-17 06:27,Peter Wafula,0741815015,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,1440
TX00184,2024-02-17 06:35,Cynthia Wanjiku,0757336174,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,140
TX00185,2024-02-17 08:36,Peter Wafula,0741815015,Nairobi,AG003,CBD Traders,CBD,send,590
TX00186,2024-02-17 19:47,Amina Omondi,0734657335,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,1910
TX00187,2024-02-17 22:30,Zawadi Odhiambo,254715527223,Kakamega,AG010,Mumias Agency,Mumias,deposit,2560
TX00188,2024-02-17 23:04,Zawadi Omondi,0732701953,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2500
TX00189,2024-02-18 04:12,Esther Ali,254717258033,Kisumu,AG003,CBD Traders,CBD,deposit,4110
TX00190,2024-02-18 12:48,Samuel Nyambura,0729502561,Kakamega,AG006,Naivasha Electronics,Naivasha,send,6410
TX00191,2024-02-18 13:20,JAMES OMONDI,0766457955,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,2030
TX00192,2024-02-19 00:21,Zawadi Ali,254738550009,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,2570
TX00193,2024-02-19 00:57,Yusuf Omondi,0738858153,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1830
TX00194,2024-02-19 02:08,Tabitha Omondi,0799935367,Kakamega,AG010,Mumias Agency,Mumias,send,1400
TX00195,2024-02-19 05:06,Peter Mutua,0758527453,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,2270
TX00196,2024-02-19 05:22,Faith Odhiambo,0788298499,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,3410
TX00197,2024-02-19 06:20,Wanjiru Kiprop,0730762633,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,1230
TX00198,2024-02-19 08:18,Emmanuel Wafula,0778528369,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,460
TX00199,2024-02-19 10:31,Esther Ali,0778898676,Nairobi,AG010,Mumias Agency,Mumias,deposit,2050
TX00200,2024-02-19 16:51,NJERI ODHIAMBO,0761137549,Nakuru,AG006,Naivasha Electronics,Naivasha,send,440
TX00201,2024-02-19 22:10,Duncan Omondi,0761565061,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,4370
TX00202,2024-02-20 04:34,Njeri Kiprop,0752888749,Kakamega,AG010,Mumias Agency,Mumias,deposit,820
TX00203,2024-02-20 17:18,Njeri Otieno,254782710955,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1580
TX00204,2024-02-21 07:47,Brian Njoroge,254790876010,Nakuru,AG011,Karatina Traders,Karatina,deposit,1070
TX00205,2024-02-21 21:41,Njeri Kiprop,0752888749,Kakamega,AG010,Mumias Agency,Mumias,deposit,1610
TX00206,2024-02-21 23:01,Otieno Ali,0796532173,Nakuru,AG010,Mumias Agency,Mumias,withdrawal,1530
TX00207,2024-02-22 01:28,George Kariuki,0779950911,Kisumu,AG004,Kondele Traders,Kondele,deposit,580
TX00208,2024-02-22 02:07,Ruth Kiprop,0781162841,Mombasa,AG008,Likoni Agency,Likoni,send,310
TX00209,2024-02-22 05:49,Njeri Otieno,+254782710955,Nairobi,AG001,Kibera Agency,Kibera,send,1420
TX00210,2024-02-22 08:58,DUNCAN KARIUKI,0720226195,Kisumu,AG002,Githurai Mobile Shop,Githurai,deposit,2870
TX00211,2024-02-22 17:02,Otieno Ali,0796532173,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,2110
TX00212,2024-02-22 20:59,Samuel Achieng,0732521987,Kakamega,AG010,Mumias Agency,Mumias,deposit,10230
TX00213,2024-02-23 00:47,Amina Ali,0751100442,Nakuru,AG001,Kibera Agency,Kibera,withdrawal,1520
TX00214,2024-02-23 09:40,Esther Ali,0778898676,Nairobi,AG001,Kibera Agency,Kibera,deposit,1610
TX00215,2024-02-23 10:39,George Kariuki,0779950911,Kisumu,AG004,Kondele Traders,Kondele,deposit,2010
TX00216,2024-02-23 11:10,Quincy Kiprop,0767945672,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,360
TX00217,2024-02-23 19:01,WANJIRU NYAMBURA,0710343706,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,3040
TX00218,2024-02-23 21:18,Irene Achieng,0728828887,Kisumu,AG004,Kondele Traders,Kondele,deposit,7180
TX00219,2024-02-24 13:52,Kevin Kariuki,0791950138,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1130
TX00220,2024-02-24 13:59,Zawadi Mutua,0780424966,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,400
TX00221,2024-02-24 14:09,Kevin Odhiambo,0789485143,Kakamega,AG010,Mumias Agency,Mumias,send,1140
TX00222,2024-02-24 15:01,Faith Achieng,0792159270,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,830
TX00223,2024-02-25 14:13,Faith Wanjiku,254781461966,Kakamega,AG010,Mumias Agency,Mumias,deposit,1800
TX00224,2024-02-25 14:36,Tabitha Odhiambo,0722804395,Kisumu,AG004,Kondele Traders,Kondele,send,2230
TX00225,2024-02-25 19:05,Yusuf Njoroge,0781698656,Mombasa,AG008,Likoni Agency,Likoni,deposit,6290
TX00226,2024-02-25 19:43,Yusuf Ali,0732456072,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,3410
TX00227,2024-02-25 22:06,Yusuf Njoroge,254781698656,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,1050
TX00228,2024-02-26 04:22,Brian Chebet,0724749319,Kisumu,AG005,Ahero Traders,Ahero,send,2150
TX00229,2024-02-26 17:01,Otieno Otieno,0714603379,Mombasa,AG008,Likoni Agency,Likoni,deposit,1390
TX00230,2024-02-26 21:00,Quincy Omondi,+254796921408,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,4840
TX00231,2024-02-26 21:09,Chebet Kamau,+254774759708,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1340
TX00232,2024-02-26 22:03,Samuel Omondi,+254773701385,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1840
TX00233,2024-02-27 02:46,Samuel Achieng,+254732521987,Kakamega,AG010,Mumias Agency,Mumias,deposit,640
TX00234,2024-02-27 09:42,Cynthia Otieno,0798918869,Mombasa,AG011,Karatina Traders,Karatina,deposit,5620
TX00235,2024-02-27 11:07,Otieno Odhiambo,0785741278,Kakamega,AG010,Mumias Agency,Mumias,send,910
TX00236,2024-02-27 11:55,Samuel Achieng,0732521987,Kakamega,AG010,Mumias Agency,Mumias,deposit,4940
TX00237,2024-02-28 02:38,Brian Chebet,0735785667,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,3560
TX00238,2024-02-28 13:17,Samuel Njoroge,+254758932135,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2980
TX00239,2024-02-28 18:18,Quincy Mutua,0796494933,Nairobi,AG010,Mumias Agency,Mumias,send,1180
TX00240,2024-02-29 00:48,Duncan Achieng,+254757533891,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1520
TX00241,2024-02-29 04:55,SAMUEL OTIENO,0769424257,Kisumu,AG005,Ahero Traders,Ahero,deposit,160
TX00242,2024-02-29 14:42,Peter Wafula,0741815015,Nairobi,AG003,CBD Traders,CBD,deposit,1980
TX00243,2024-02-29 15:24,Njeri Odhiambo,+254761137549,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,980
TX00244,2024-02-29 16:01,Samuel Omondi,0773701385,Kisumu,AG005,Ahero Traders,Ahero,deposit,1270
TX00245,2024-02-29 22:23,Quincy Omondi,0796921408,Mombasa,AG008,Likoni Agency,Likoni,send,240
TX00246,2024-03-01 01:15,George Omondi,0738982885,Kisumu,AG004,Kondele Traders,Kondele,deposit,2700
TX00247,2024-03-01 20:02,Chebet Kiprop,0744309985,Nyeri,AG011,Karatina Traders,Karatina,deposit,3610
TX00248,2024-03-02 00:05,Brian Chebet,0724749319,Kisumu,AG004,Kondele Traders,Kondele,send,310
TX00249,2024-03-02 04:37,Peter Mutua,0728142270,Kisumu,AG004,Kondele Traders,Kondele,deposit,3500
TX00250,2024-03-02 20:21,Amina Omondi,0730800514,Kisumu,AG004,Kondele Traders,Kondele,deposit,1250
TX00251,2024-03-04 04:08,Faith Achieng,0792159270,Mombasa,AG008,Likoni Agency,Likoni,send,170
TX00252,2024-03-04 04:52,Yusuf Omondi,0738858153,Nairobi,AG003,CBD Traders,CBD,deposit,3610
TX00253,2024-03-04 05:25,Ruth Mutua,0749753097,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,800
TX00254,2024-03-04 05:45,Samuel Kamau,+254797288130,Kisumu,AG005,Ahero Traders,Ahero,send,500
TX00255,2024-03-04 14:14,Zawadi Omondi,+254732701953,Kakamega,AG010,Mumias Agency,Mumias,deposit,1110
TX00256,2024-03-04 18:24,Zawadi Ali,0738550009,Nairobi,AG003,CBD Traders,CBD,withdrawal,3420
TX00257,2024-03-04 20:33,Brian Ali,0777540098,Mombasa,AG008,Likoni Agency,Likoni,deposit,1160
TX00258,2024-03-04 23:58,Esther Achieng,+254778860702,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,2300
TX00259,2024-03-05 17:13,Otieno Njoroge,0792922794,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1850
TX00260,2024-03-05 21:14,Peter Kiprop,+254723642023,Nyeri,AG011,Karatina Traders,Karatina,send,2160
TX00261,2024-03-06 10:55,Kevin Odhiambo,0789485143,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2750
TX00262,2024-03-06 23:55,Achieng Njoroge,0770692216,Kakamega,AG010,Mumias Agency,Mumias,deposit,700
TX00263,2024-03-07 00:36,Yusuf Ali,0732456072,Kisumu,AG005,Ahero Traders,Ahero,send,2570
TX00264,2024-03-07 01:51,Brian Njoroge,0790876010,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,2570
TX00265,2024-03-07 04:48,Amina Achieng,+254740467830,Nyeri,AG011,Karatina Traders,Karatina,deposit,2400
TX00266,2024-03-07 04:48,Esther Chebet,+254732335804,Kisumu,AG010,Mumias Agency,Mumias,deposit,5100
TX00267,2024-03-07 09:40,Wanjiru Kiprop,+254730762633,Nairobi,AG003,CBD Traders,CBD,withdrawal,3340
TX00268,2024-03-07 15:47,Ruth Mutua,0765990081,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,2290
TX00269,2024-03-07 19:38,Daniel Kiprop,+254798585568,Nairobi,AG001,Kibera Agency,Kibera,deposit,3510
TX00270,2024-03-08 13:26,Kevin Odhiambo,0793945277,Mombasa,AG011,Karatina Traders,Karatina,deposit,2320
TX00271,2024-03-08 18:00,Mercy Kiprop,0768729052,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,3710
TX00272,2024-03-08 21:24,Njeri Kiprop,+254752888749,Kakamega,AG010,Mumias Agency,Mumias,deposit,420
TX00273,2024-03-09 03:31,Amina Omondi,0734657335,Nyeri,AG011,Karatina Traders,Karatina,deposit,5810
TX00274,2024-03-09 11:59,Ruth Mutua,0765990081,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,990
TX00275,2024-03-09 21:28,Cynthia Wanjiku,0757336174,Kisumu,AG009,Changamwe Electronics,Changamwe,withdrawal,3400
TX00276,2024-03-10 02:17,Otieno Otieno,0714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1040
TX00277,2024-03-10 02:30,Otieno Kiprop,0794761775,Kisumu,AG004,Kondele Traders,Kondele,send,640
TX00278,2024-03-10 04:26,TABITHA OTIENO,0768320549,Mombasa,AG008,Likoni Agency,Likoni,deposit,5590
TX00279,2024-03-10 10:13,Ruth Mwangi,0735434684,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,390
TX00280,2024-03-10 12:13,Zawadi Mutua,0734425622,Nairobi,AG010,Mumias Agency,Mumias,withdrawal,1210
TX00281,2024-03-11 09:36,Peter Mutua,+254728142270,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,3390
TX00282,2024-03-11 11:31,Cynthia Njoroge,0742670375,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,1170
TX00283,2024-03-11 15:07,Esther Ali,254717258033,Kisumu,AG005,Ahero Traders,Ahero,send,4340
TX00284,2024-03-11 19:59,Chebet Nyambura,0745155401,Kakamega,AG010,Mumias Agency,Mumias,deposit,800
TX00285,2024-03-11 22:25,Amina Omondi,0734657335,Nyeri,AG011,Karatina Traders,Karatina,withdrawal,2690
TX00286,2024-03-11 22:50,Samuel Chebet,0781181137,Nairobi,AG010,Mumias Agency,Mumias,deposit,1560
TX00287,2024-03-12 03:12,Yusuf Ali,0732456072,Kisumu,AG005,Ahero Traders,Ahero,deposit,2630
TX00288,2024-03-12 07:08,Samuel Otieno,0769424257,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2020
TX00289,2024-03-12 09:58,Tabitha Otieno,0787970492,Kakamega,AG010,Mumias Agency,Mumias,deposit,1430
TX00290,2024-03-12 10:12,James Kiprop,0743585965,Nakuru,AG007,Molo Mobile Shop,Molo,send,560
TX00291,2024-03-12 17:03,Victor Mutua,0794959393,Mombasa,AG008,Likoni Agency,Likoni,deposit,1490
TX00292,2024-03-12 22:33,Irene Achieng,+254728828887,Kisumu,AG005,Ahero Traders,Ahero,deposit,750
TX00293,2024-03-13 06:00,RUTH MUTUA,0765990081,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,2430
TX00294,2024-03-13 06:58,George Omondi,254738982885,Kisumu,AG005,Ahero Traders,Ahero,deposit,6080
TX00295,2024-03-13 10:09,Faith Odhiambo,0788298499,Nakuru,AG002,Githurai Mobile Shop,Githurai,withdrawal,2390
TX00296,2024-03-13 23:57,Hassan Wafula,0789447302,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,810
TX00297,2024-03-14 06:03,Samuel Ali,0735580256,Kakamega,AG010,Mumias Agency,Mumias,deposit,1450
TX00298,2024-03-14 21:03,OTIENO OTIENO,0714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1160
TX00299,2024-03-14 21:53,Ruth Kamau,0755338137,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,3410
TX00300,2024-03-15 10:09,Samuel Kamau,+254797288130,Kisumu,AG008,Likoni Agency,Likoni,deposit,2220
TX00301,2024-03-15 17:39,Zawadi Omondi,+254732701953,Kakamega,AG005,Ahero Traders,Ahero,send,1960
TX00302,2024-03-15 21:17,Njeri Odhiambo,0761137549,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1600
TX00303,2024-03-16 00:26,George Wafula,254745274138,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,1370
TX00304,2024-03-16 02:40,Samuel Omondi,+254773701385,Kisumu,AG004,Kondele Traders,Kondele,deposit,3220
TX00305,2024-03-16 11:06,Wanjiru Mwangi,+254739166890,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,4350
TX00306,2024-03-16 14:49,Faith Wanjiku,0781461966,Kakamega,AG007,Molo Mobile Shop,Molo,withdrawal,1720
TX00307,2024-03-16 17:45,Chebet Kamau,0774759708,Kisumu,AG004,Kondele Traders,Kondele,send,1100
TX00308,2024-03-16 22:45,Wanjiru Nyambura,+254710343706,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1280
TX00309,2024-03-17 00:30,Wanjiru Ali,+254717521064,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1510
TX00310,2024-03-17 05:21,Otieno Wanjiku,0739912527,Kisumu,AG008,Likoni Agency,Likoni,withdrawal,830
TX00311,2024-03-17 09:16,James Chebet,0783445203,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,740
TX00312,2024-03-17 15:17,Otieno Ali,0796532173,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,2900
TX00313,2024-03-17 16:29,Esther Mutua,0763337519,Kisumu,AG004,Kondele Traders,Kondele,deposit,3430
TX00314,2024-03-17 19:29,Esther Ali,0778898676,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,1630
TX00315,2024-03-18 01:16,Faith Chebet,0770855361,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,4430
TX00316,2024-03-18 04:03,Njeri Odhiambo,0761137549,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,4270
TX00317,2024-03-18 04:23,Lucy Nyambura,+254783896326,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,90
TX00318,2024-03-18 12:18,Njeri Kiprop,0752888749,Kakamega,AG010,Mumias Agency,Mumias,deposit,2020
TX00319,2024-03-18 16:25,Ruth Mutua,0765990081,Nyeri,AG011,Karatina Traders,Karatina,send,650
TX00320,2024-03-19 05:40,Tabitha Ali,+254714969608,Nyeri,AG011,Karatina Traders,Karatina,deposit,1260
TX00321,2024-03-19 06:38,James Kiprop,+254743585965,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,2140
TX00322,2024-03-19 10:32,Samuel Omondi,0773701385,Kisumu,AG004,Kondele Traders,Kondele,send,420
TX00323,2024-03-19 11:12,Yusuf Otieno,0747751577,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,1210
TX00324,2024-03-19 13:05,Esther Achieng,0778860702,Mombasa,AG008,Likoni Agency,Likoni,send,150
TX00325,2024-03-19 21:41,Esther Ali,0717258033,Kisumu,AG004,Kondele Traders,Kondele,deposit,1620
TX00326,2024-03-20 04:53,Quincy Mutua,0796494933,Nairobi,AG001,Kibera Agency,Kibera,deposit,5850
TX00327,2024-03-20 05:43,Irene Njoroge,0783442361,Nairobi,AG008,Likoni Agency,Likoni,send,1420
TX00328,2024-03-20 05:59,Tabitha Otieno,0768320549,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,3390
TX00329,2024-03-20 06:45,Otieno Ali,0796532173,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,3040
TX00330,2024-03-20 10:58,Samuel Ali,0735580256,Kakamega,AG010,Mumias Agency,Mumias,deposit,2640
TX00331,2024-03-20 12:11,Brian Ali,0758236176,Nairobi,AG003,CBD Traders,CBD,deposit,4000
TX00332,2024-03-20 21:53,Chebet Kiprop,+254744309985,Nyeri,AG004,Kondele Traders,Kondele,send,970
TX00333,2024-03-21 00:44,Emmanuel Omondi,0725380344,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,2590
TX00334,2024-03-21 02:56,Ruth Kamau,0755338137,Mombasa,AG008,Likoni Agency,Likoni,send,890
TX00335,2024-03-21 15:14,Amina Ali,0751100442,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,4790
TX00336,2024-03-21 16:11,Zawadi Omondi,0732701953,Kakamega,AG010,Mumias Agency,Mumias,deposit,2870
TX00337,2024-03-21 16:48,Kevin Odhiambo,254789485143,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,4380
TX00338,2024-03-21 21:16,Lucy Otieno,0782207908,Kakamega,AG010,Mumias Agency,Mumias,deposit,5280
TX00339,2024-03-21 22:18,Samuel Achieng,0732521987,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2140
TX00340,2024-03-22 13:14,George Wanjiku,0745870866,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,4240
TX00341,2024-03-22 20:43,Zawadi Mutua,254780424966,Kisumu,AG004,Kondele Traders,Kondele,send,2750
TX00342,2024-03-22 22:00,Emmanuel Kiprop,+254766332024,Kisumu,AG005,Ahero Traders,Ahero,deposit,2470
TX00343,2024-03-23 03:04,Zawadi Ali,0738550009,Nairobi,AG003,CBD Traders,CBD,withdrawal,630
TX00344,2024-03-23 11:48,George Omondi,0738982885,Kisumu,AG003,CBD Traders,CBD,deposit,3050
TX00345,2024-03-23 19:02,Esther Ali,0778898676,Nairobi,AG005,Ahero Traders,Ahero,deposit,2870
TX00346,2024-03-24 07:45,Kevin Odhiambo,0798234176,Kakamega,AG010,Mumias Agency,Mumias,send,1900
TX00347,2024-03-24 20:02,Zawadi Mutua,0734425622,Nairobi,AG003,CBD Traders,CBD,withdrawal,2890
TX00348,2024-03-25 10:31,Chebet Kamau,+254774759708,Kisumu,AG011,Karatina Traders,Karatina,send,1690
TX00349,2024-03-25 11:26,Njeri Odhiambo,0761137549,Nakuru,AG009,Changamwe Electronics,Changamwe,withdrawal,1530
TX00350,2024-03-25 21:07,Brian Chebet,+254735785667,Nyeri,AG011,Karatina Traders,Karatina,send,340
TX00351,2024-03-26 01:39,Lucy Otieno,0782207908,Kakamega,AG011,Karatina Traders,Karatina,deposit,1090
TX00352,2024-03-26 16:36,Yusuf Odhiambo,0713732630,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,2410
TX00353,2024-03-26 16:39,HASSAN WAFULA,+254789447302,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,2860
TX00354,2024-03-26 18:18,Duncan Omondi,+254761565061,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,3060
TX00355,2024-03-26 18:42,Daniel Kamau,0757110322,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2070
TX00356,2024-03-27 03:03,Chebet Kiprop,0744309985,Nyeri,AG010,Mumias Agency,Mumias,send,1810
TX00357,2024-03-27 06:02,Otieno Odhiambo,0748664970,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,3740
TX00358,2024-03-27 08:55,Chebet Kiprop,0744309985,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,3340
TX00359,2024-03-27 12:03,Tabitha Odhiambo,0722804395,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2580
TX00360,2024-03-27 15:15,Tabitha Odhiambo,+254722804395,Kisumu,AG005,Ahero Traders,Ahero,send,260
TX00361,2024-03-27 16:17,AMINA OMONDI,0730800514,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2370
TX00362,2024-03-27 19:46,Samuel Njoroge,+254758932135,Kisumu,AG005,Ahero Traders,Ahero,send,1500
TX00363,2024-03-28 05:53,Brian Njoroge,0790876010,Nakuru,AG006,Naivasha Electronics,Naivasha,send,740
TX00364,2024-03-28 21:00,Irene Kariuki,+254787902687,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1580
TX00365,2024-03-29 01:51,Samuel Omondi,0773701385,Kisumu,AG004,Kondele Traders,Kondele,deposit,2470
TX00366,2024-03-29 07:38,Daniel Kiprop,0798585568,Nairobi,AG003,CBD Traders,CBD,withdrawal,2590
TX00367,2024-03-30 01:29,James Omondi,254766457955,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,600
TX00368,2024-03-30 07:08,Peter Mutua,0758527453,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,630
TX00369,2024-03-30 09:57,Tabitha Kariuki,0712826756,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,5580
TX00370,2024-03-30 17:56,Wanjiru Kiprop,254730762633,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1660
TX00371,2024-03-31 03:31,Otieno Odhiambo,254748664970,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,1300
TX00372,2024-04-01 03:36,Faith Achieng,0792159270,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,4180
TX00373,2024-04-01 14:37,Otieno Odhiambo,0785741278,Kakamega,AG010,Mumias Agency,Mumias,deposit,1930
TX00374,2024-04-01 22:49,Daniel Kamau,0757110322,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,3860
TX00375,2024-04-02 19:45,Kevin Odhiambo,0793945277,Mombasa,AG008,Likoni Agency,Likoni,deposit,4730
TX00376,2024-04-02 21:10,George Kariuki,254779950911,Kisumu,AG005,Ahero Traders,Ahero,send,1010
TX00377,2024-04-03 00:38,Irene Kariuki,0787902687,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,2240
TX00378,2024-04-03 03:19,WANJIRU MWANGI,0739166890,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2710
TX00379,2024-04-03 11:09,CYNTHIA KAMAU,0746618936,Nairobi,AG003,CBD Traders,CBD,send,1290
TX00380,2024-04-03 14:53,Tabitha Wanjiku,0791654489,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,1040
TX00381,2024-04-04 01:37,Otieno Ali,0796532173,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,2520
TX00382,2024-04-04 02:18,Kevin Kamau,0786124492,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,3390
TX00383,2024-04-04 02:21,Tabitha Kariuki,254712826756,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,2790
TX00384,2024-04-04 04:30,Emmanuel Wafula,+254778528369,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1080
TX00385,2024-04-05 05:42,Cynthia Kamau,0746618936,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,510
TX00386,2024-04-05 16:36,Quincy Achieng,0740454092,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,2930
TX00387,2024-04-06 20:33,Njeri Kiprop,254752888749,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,840
TX00388,2024-04-07 02:46,Achieng Kamau,254715656728,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,7360
TX00389,2024-04-07 23:00,Wanjiru Ali,0717521064,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,4780
TX00390,2024-04-08 00:32,Esther Chebet,+254732335804,Kisumu,AG005,Ahero Traders,Ahero,deposit,4010
TX00391,2024-04-08 04:50,Kevin Kamau,0786124492,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,3140
TX00392,2024-04-08 16:44,Kevin Odhiambo,0789485143,Kakamega,AG010,Mumias Agency,Mumias,send,3150
TX00393,2024-04-08 20:45,Yusuf Otieno,0747751577,Nyeri,AG011,Karatina Traders,Karatina,deposit,1760
TX00394,2024-04-08 21:09,Chebet Nyambura,0745155401,Kakamega,AG010,Mumias Agency,Mumias,deposit,7230
TX00395,2024-04-09 10:28,Emmanuel Mutua,0777249423,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,2290
TX00396,2024-04-09 11:01,Yusuf Otieno,254747751577,Nyeri,AG011,Karatina Traders,Karatina,deposit,1970
TX00397,2024-04-09 12:25,Tabitha Nyambura,+254723654616,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1880
TX00398,2024-04-09 19:09,Cynthia Kamau,0746618936,Nairobi,AG001,Kibera Agency,Kibera,deposit,4450
TX00399,2024-04-09 23:24,Wanjiru Kariuki,0713702236,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,3260
TX00400,2024-04-09 23:42,Njeri Otieno,+254782710955,Nairobi,AG003,CBD Traders,CBD,deposit,1560
TX00401,2024-04-10 01:25,Kevin Kamau,0786124492,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,1670
TX00402,2024-04-10 08:12,Tabitha Otieno,0787970492,Kakamega,AG010,Mumias Agency,Mumias,deposit,3020
TX00403,2024-04-10 21:07,Amina Kariuki,+254780857257,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,1390
TX00404,2024-04-11 00:57,Hassan Wafula,0789447302,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,1640
TX00405,2024-04-11 04:30,Yusuf Ali,0732456072,Kisumu,AG003,CBD Traders,CBD,deposit,7450
TX00406,2024-04-11 05:32,Kevin Ali,0736810718,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,4740
TX00407,2024-04-11 10:57,Brian Njoroge,0790876010,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,750
TX00408,2024-04-11 12:42,Yusuf Otieno,0747751577,Nyeri,AG011,Karatina Traders,Karatina,deposit,680
TX00409,2024-04-12 01:30,Quincy Achieng,0740454092,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,2080
TX00410,2024-04-12 03:29,Faith Wanjiku,0781461966,Kakamega,AG010,Mumias Agency,Mumias,send,2370
TX00411,2024-04-12 03:53,Victor Nyambura,+254792481430,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2640
TX00412,2024-04-12 09:47,James Chebet,0783445203,Nairobi,AG001,Kibera Agency,Kibera,deposit,1890
TX00413,2024-04-12 14:14,Ruth Wafula,+254717982346,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,1970
TX00414,2024-04-12 16:15,Otieno Wanjiku,0739912527,Kisumu,AG005,Ahero Traders,Ahero,deposit,1890
TX00415,2024-04-13 03:50,SAMUEL ACHIENG,+254732521987,Kakamega,AG010,Mumias Agency,Mumias,send,840
TX00416,2024-04-13 17:36,Zawadi Mutua,0734425622,Nairobi,AG003,CBD Traders,CBD,deposit,1490
TX00417,2024-04-13 19:40,Otieno Wanjiku,0739912527,Kisumu,AG008,Likoni Agency,Likoni,deposit,2810
TX00418,2024-04-13 21:20,Cynthia Kamau,+254746618936,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1480
TX00419,2024-04-13 21:36,Irene Njoroge,254783442361,Nairobi,AG001,Kibera Agency,Kibera,deposit,3150
TX00420,2024-04-14 03:07,Lucy Mutua,+254753343892,Nairobi,AG008,Likoni Agency,Likoni,deposit,3410
TX00421,2024-04-14 14:06,Duncan Achieng,0757533891,Kisumu,AG004,Kondele Traders,Kondele,deposit,1360
TX00422,2024-04-15 05:52,Peter Kiprop,0723642023,Nyeri,AG008,Likoni Agency,Likoni,withdrawal,930
TX00423,2024-04-15 13:34,Tabitha Nyambura,254723654616,Nairobi,AG003,CBD Traders,CBD,deposit,2900
TX00424,2024-04-15 17:54,Daniel Kiprop,0798585568,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1610
TX00425,2024-04-16 00:05,Esther Ali,+254717258033,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2530
TX00426,2024-04-16 12:40,RUTH MUTUA,0765990081,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,1360
TX00427,2024-04-16 14:35,Quincy Kiprop,0767945672,Mombasa,AG010,Mumias Agency,Mumias,withdrawal,4210
TX00428,2024-04-16 20:14,Brian Ali,0758236176,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,3070
TX00429,2024-04-17 03:19,Peter Mutua,254728142270,Kisumu,AG004,Kondele Traders,Kondele,send,310
TX00430,2024-04-17 09:48,Yusuf Njoroge,0781698656,Mombasa,AG008,Likoni Agency,Likoni,send,750
TX00431,2024-04-17 11:28,Irene Njoroge,254783442361,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,3850
TX00432,2024-04-17 20:24,Duncan Achieng,0757533891,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,4480
TX00433,2024-04-18 08:08,Wanjiru Nyambura,0710343706,Kisumu,AG005,Ahero Traders,Ahero,deposit,1990
TX00434,2024-04-18 18:08,Amina Omondi,0730800514,Kisumu,AG005,Ahero Traders,Ahero,send,2020
TX00435,2024-04-19 18:41,AMINA KARIUKI,0780857257,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,80
TX00436,2024-04-19 20:45,Tabitha Otieno,0768320549,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1150
TX00437,2024-04-19 23:14,SAMUEL ACHIENG,0732521987,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,4110
TX00438,2024-04-20 00:04,Wanjiru Nyambura,+254710343706,Kisumu,AG005,Ahero Traders,Ahero,send,2020
TX00439,2024-04-20 07:05,Samuel Otieno,0769424257,Kisumu,AG004,Kondele Traders,Kondele,deposit,1240
TX00440,2024-04-20 13:30,AMINA OMONDI,0734657335,Nyeri,AG011,Karatina Traders,Karatina,deposit,7630
TX00441,2024-04-20 16:01,Zawadi Mutua,0780424966,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1740
TX00442,2024-04-20 19:57,Yusuf Omondi,0738858153,Nairobi,AG011,Karatina Traders,Karatina,send,420
TX00443,2024-04-20 21:13,James Omondi,0766457955,Nairobi,AG001,Kibera Agency,Kibera,deposit,2420
TX00444,2024-04-21 00:08,James Mutua,0745468032,Kakamega,AG010,Mumias Agency,Mumias,deposit,1160
TX00445,2024-04-21 11:03,Ruth Mutua,+254749753097,Mombasa,AG008,Likoni Agency,Likoni,send,3820
TX00446,2024-04-21 11:43,Ruth Mutua,0749753097,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,1020
TX00447,2024-04-21 18:41,Mercy Nyambura,0747913516,Kisumu,AG004,Kondele Traders,Kondele,send,420
TX00448,2024-04-22 00:22,Tabitha Otieno,+254768320549,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,2320
TX00449,2024-04-22 01:07,Chebet Nyambura,0745155401,Kakamega,AG010,Mumias Agency,Mumias,send,360
TX00450,2024-04-22 06:30,Victor Mutua,254794959393,Mombasa,AG005,Ahero Traders,Ahero,deposit,2390
TX00451,2024-04-22 07:20,Lucy Mutua,0753343892,Nairobi,AG006,Naivasha Electronics,Naivasha,deposit,7510
TX00452,2024-04-22 11:10,Tabitha Wanjiku,0791654489,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,6350
TX00453,2024-04-22 12:38,Cynthia Wanjiku,+254757336174,Kisumu,AG011,Karatina Traders,Karatina,deposit,5180
TX00454,2024-04-22 13:50,Yusuf Odhiambo,0713732630,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,4090
TX00455,2024-04-22 16:19,Cynthia Odhiambo,0763710064,Nyeri,AG002,Githurai Mobile Shop,Githurai,deposit,3350
TX00456,2024-04-22 20:08,Samuel Ali,0735580256,Kakamega,AG010,Mumias Agency,Mumias,deposit,3560
TX00457,2024-04-23 00:01,George Omondi,+254738982885,Kisumu,AG003,CBD Traders,CBD,deposit,5880
TX00458,2024-04-23 01:29,Irene Otieno,0775963806,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,3220
TX00459,2024-04-23 03:44,Kevin Kariuki,0791950138,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,5320
TX00460,2024-04-24 05:37,Esther Mutua,254763337519,Kisumu,AG005,Ahero Traders,Ahero,deposit,2050
TX00461,2024-04-24 07:02,Tabitha Otieno,0787970492,Kakamega,AG010,Mumias Agency,Mumias,deposit,2060
TX00462,2024-04-24 09:27,Tabitha Odhiambo,0722804395,Kisumu,AG004,Kondele Traders,Kondele,deposit,770
TX00463,2024-04-24 11:13,George Omondi,0738982885,Kisumu,AG004,Kondele Traders,Kondele,deposit,1080
TX00464,2024-04-25 01:28,George Wanjiku,+254745870866,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,2410
TX00465,2024-04-25 01:57,Duncan Omondi,254761565061,Kisumu,AG005,Ahero Traders,Ahero,send,1410
TX00466,2024-04-25 06:58,Victor Mutua,0794959393,Mombasa,AG008,Likoni Agency,Likoni,deposit,3600
TX00467,2024-04-25 11:40,Ruth Mwangi,0735434684,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,280
TX00468,2024-04-25 20:04,Tabitha Wanjiku,0791654489,Nairobi,AG001,Kibera Agency,Kibera,send,660
TX00469,2024-04-26 09:11,Wanjiru Kariuki,0713702236,Nyeri,AG011,Karatina Traders,Karatina,deposit,850
TX00470,2024-04-26 17:10,BRIAN ALI,0758236176,Nairobi,AG003,CBD Traders,CBD,deposit,4090
TX00471,2024-04-26 17:37,George Kariuki,254779950911,Kisumu,AG004,Kondele Traders,Kondele,send,1130
TX00472,2024-04-27 00:24,Duncan Omondi,+254761565061,Kisumu,AG005,Ahero Traders,Ahero,send,2650
TX00473,2024-04-27 01:18,Wanjiru Nyambura,0710343706,Kisumu,AG009,Changamwe Electronics,Changamwe,deposit,2980
TX00474,2024-04-27 06:59,Quincy Mutua,0796494933,Nairobi,AG001,Kibera Agency,Kibera,send,1100
TX00475,2024-04-27 08:48,Faith Chebet,0770855361,Kakamega,AG010,Mumias Agency,Mumias,send,2920
TX00476,2024-04-27 10:12,Yusuf Achieng,0718327276,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,4040
TX00477,2024-04-27 15:05,TABITHA OTIENO,0768320549,Mombasa,AG008,Likoni Agency,Likoni,deposit,2650
TX00478,2024-04-27 19:12,Ruth Ali,+254768594225,Nyeri,AG002,Githurai Mobile Shop,Githurai,withdrawal,2450
TX00479,2024-04-28 07:54,Samuel Njoroge,+254758932135,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1180
TX00480,2024-04-28 08:53,Cynthia Kamau,0746618936,Nairobi,AG003,CBD Traders,CBD,send,1410
TX00481,2024-04-28 10:31,Amina Achieng,0740467830,Nyeri,AG011,Karatina Traders,Karatina,send,2660
TX00482,2024-04-28 18:31,Samuel Kamau,0797288130,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,510
TX00483,2024-04-28 23:08,Ruth Mutua,0749753097,Mombasa,AG008,Likoni Agency,Likoni,deposit,1090
TX00484,2024-04-28 23:21,RUTH MUTUA,0765990081,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,920
TX00485,2024-04-29 00:11,Quincy Mutua,+254796494933,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,3460
TX00486,2024-04-29 05:38,Duncan Omondi,0761565061,Kisumu,AG004,Kondele Traders,Kondele,deposit,4030
TX00487,2024-04-29 11:39,Esther Ali,254717258033,Kisumu,AG004,Kondele Traders,Kondele,send,2060
TX00488,2024-04-29 18:02,James Omondi,0766457955,Nairobi,AG006,Naivasha Electronics,Naivasha,deposit,430
TX00489,2024-04-29 19:19,Duncan Achieng,254757533891,Kisumu,AG004,Kondele Traders,Kondele,deposit,10070
TX00490,2024-04-29 20:19,Otieno Njoroge,0792922794,Kakamega,AG010,Mumias Agency,Mumias,send,1130
TX00491,2024-04-30 02:48,Zawadi Ali,0738550009,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,4700
TX00492,2024-04-30 09:02,George Omondi,0738982885,Kisumu,AG005,Ahero Traders,Ahero,send,1130
TX00493,2024-04-30 13:44,Ruth Mwangi,0735434684,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,3500
TX00494,2024-05-01 05:39,Quincy Omondi,0796921408,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,1850
TX00495,2024-05-01 17:37,James Kiprop,+254743585965,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,1560
TX00496,2024-05-02 04:05,Faith Wanjiku,0781461966,Kakamega,AG010,Mumias Agency,Mumias,deposit,3540
TX00497,2024-05-02 10:19,Ruth Wafula,+254717982346,Nyeri,AG009,Changamwe Electronics,Changamwe,withdrawal,790
TX00498,2024-05-02 11:19,Daniel Kiprop,0798585568,Nairobi,AG004,Kondele Traders,Kondele,send,820
TX00499,2024-05-02 13:22,SAMUEL CHEBET,+254781181137,Nairobi,AG001,Kibera Agency,Kibera,deposit,1420
TX00500,2024-05-02 22:16,George Kariuki,+254779950911,Kisumu,AG004,Kondele Traders,Kondele,deposit,1760
TX00501,2024-05-03 03:01,Otieno Ali,+254796532173,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,460
TX00502,2024-05-03 10:28,Ruth Kiprop,0781162841,Mombasa,AG008,Likoni Agency,Likoni,deposit,1580
TX00503,2024-05-03 12:23,Esther Achieng,0778860702,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,2120
TX00504,2024-05-04 02:13,Otieno Njoroge,254792922794,Kakamega,AG010,Mumias Agency,Mumias,deposit,2210
TX00505,2024-05-04 09:44,Kevin Kariuki,+254791950138,Mombasa,AG009,Changamwe Electronics,Changamwe,send,310
TX00506,2024-05-05 01:04,Otieno Otieno,0714603379,Mombasa,AG008,Likoni Agency,Likoni,deposit,2560
TX00507,2024-05-05 17:16,Njeri Kiprop,0752888749,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2120
TX00508,2024-05-05 20:53,Emmanuel Omondi,0725380344,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1890
TX00509,2024-05-06 00:01,Quincy Omondi,0796921408,Mombasa,AG011,Karatina Traders,Karatina,withdrawal,1650
TX00510,2024-05-06 01:13,Duncan Achieng,0757533891,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,6890
TX00511,2024-05-06 02:32,Peter Otieno,0756906200,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,70
TX00512,2024-05-06 02:43,Amina Achieng,0740467830,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,1460
TX00513,2024-05-06 06:55,George Kariuki,0779950911,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2110
TX00514,2024-05-06 08:03,Brian Chebet,0735785667,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,1050
TX00515,2024-05-06 08:17,Ruth Ali,0792588118,Kisumu,AG004,Kondele Traders,Kondele,deposit,4690
TX00516,2024-05-06 10:37,Esther Ali,0778898676,Nairobi,AG003,CBD Traders,CBD,deposit,3990
TX00517,2024-05-06 14:11,Ruth Kiprop,0781162841,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,830
TX00518,2024-05-06 22:26,Samuel Chebet,254781181137,Nairobi,AG009,Changamwe Electronics,Changamwe,withdrawal,2190
TX00519,2024-05-07 00:22,Duncan Achieng,0757533891,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2410
TX00520,2024-05-07 04:34,Esther Omondi,0721708124,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,3000
TX00521,2024-05-07 07:56,Samuel Nyambura,0729502561,Kakamega,AG010,Mumias Agency,Mumias,deposit,1110
TX00522,2024-05-07 21:25,James Achieng,+254724507260,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,3100
TX00523,2024-05-07 22:50,Otieno Odhiambo,254785741278,Kakamega,AG010,Mumias Agency,Mumias,deposit,1210
TX00524,2024-05-08 01:52,Yusuf Ali,0732456072,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2050
TX00525,2024-05-08 10:22,Wanjiru Kiprop,+254730762633,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,3310
TX00526,2024-05-08 15:35,Ruth Kamau,0755338137,Mombasa,AG009,Changamwe Electronics,Changamwe,send,750
TX00527,2024-05-08 19:09,Tabitha Otieno,0768320549,Mombasa,AG008,Likoni Agency,Likoni,send,2100
TX00528,2024-05-08 22:35,FAITH CHEBET,254770855361,Kakamega,AG008,Likoni Agency,Likoni,deposit,3880
TX00529,2024-05-08 23:48,KEVIN ODHIAMBO,0724934058,Mombasa,AG008,Likoni Agency,Likoni,deposit,1610
TX00530,2024-05-09 00:18,Tabitha Kariuki,0712826756,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1720
TX00531,2024-05-09 02:49,Kevin Kamau,0786124492,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,7510
TX00532,2024-05-09 21:48,Victor Nyambura,0782470004,Nakuru,AG006,Naivasha Electronics,Naivasha,send,2650
TX00533,2024-05-10 04:42,Tabitha Otieno,+254787970492,Kakamega,AG010,Mumias Agency,Mumias,deposit,880
TX00534,2024-05-11 04:39,QUINCY KIPROP,254767945672,Mombasa,AG008,Likoni Agency,Likoni,deposit,2840
TX00535,2024-05-11 08:27,Emmanuel Wafula,0778528369,Kisumu,AG003,CBD Traders,CBD,deposit,1200
TX00536,2024-05-11 09:10,Faith Achieng,+254792159270,Mombasa,AG008,Likoni Agency,Likoni,deposit,4890
TX00537,2024-05-11 09:37,Esther Omondi,0721708124,Nyeri,AG011,Karatina Traders,Karatina,deposit,3060
TX00538,2024-05-11 12:16,George Wafula,0745274138,Mombasa,AG008,Likoni Agency,Likoni,deposit,1080
TX00539,2024-05-11 16:33,Yusuf Njoroge,254781698656,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1160
TX00540,2024-05-11 17:15,Kevin Kariuki,0791950138,Mombasa,AG008,Likoni Agency,Likoni,send,1790
TX00541,2024-05-12 03:47,Brian Chebet,+254724749319,Kisumu,AG005,Ahero Traders,Ahero,send,700
TX00542,2024-05-12 08:37,Samuel Nyambura,0729502561,Kakamega,AG010,Mumias Agency,Mumias,deposit,4990
TX00543,2024-05-12 09:28,Mercy Kiprop,0768729052,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,990
TX00544,2024-05-12 09:43,Duncan Kariuki,0720226195,Kisumu,AG008,Likoni Agency,Likoni,withdrawal,690
TX00545,2024-05-12 18:33,Esther Ali,0717258033,Kisumu,AG004,Kondele Traders,Kondele,deposit,2500
TX00546,2024-05-13 00:36,Otieno Mutua,+254793658336,Mombasa,AG004,Kondele Traders,Kondele,send,510
TX00547,2024-05-13 00:53,Otieno Odhiambo,0748664970,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,380
TX00548,2024-05-13 01:44,Quincy Mutua,0796494933,Nairobi,AG003,CBD Traders,CBD,deposit,400
TX00549,2024-05-13 03:37,Mercy Nyambura,+254747913516,Kisumu,AG004,Kondele Traders,Kondele,deposit,1510
TX00550,2024-05-13 04:33,Otieno Ali,254796532173,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,3470
TX00551,2024-05-13 08:12,Brian Chebet,0724749319,Kisumu,AG007,Molo Mobile Shop,Molo,deposit,3330
TX00552,2024-05-13 09:20,Amina Omondi,0734657335,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,5170
TX00553,2024-05-13 23:59,Faith Odhiambo,+254788298499,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,3750
TX00554,2024-05-14 04:14,Samuel Achieng,0732521987,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1320
TX00555,2024-05-14 04:19,Tabitha Mutua,254756826189,Nakuru,AG007,Molo Mobile Shop,Molo,send,2010
TX00556,2024-05-14 06:19,RUTH KIPROP,0717570364,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1560
TX00557,2024-05-14 06:21,Emmanuel Mutua,254777249423,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,5140
TX00558,2024-05-14 14:01,QUINCY MUTUA,254796494933,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,670
TX00559,2024-05-14 14:48,Yusuf Otieno,0747751577,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,3540
TX00560,2024-05-15 07:59,Brian Ali,0758236176,Nairobi,AG001,Kibera Agency,Kibera,deposit,790
TX00561,2024-05-15 17:32,Tabitha Mutua,0756826189,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,890
TX00562,2024-05-16 02:06,Faith Achieng,+254792159270,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,680
TX00563,2024-05-16 06:06,Yusuf Omondi,0738858153,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,1260
TX00564,2024-05-16 07:03,Zawadi Mutua,0780424966,Kisumu,AG005,Ahero Traders,Ahero,send,620
TX00565,2024-05-16 13:48,Emmanuel Omondi,+254725380344,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,6540
TX00566,2024-05-16 18:56,Samuel Otieno,0769424257,Kisumu,AG005,Ahero Traders,Ahero,deposit,630
TX00567,2024-05-17 06:29,Tabitha Wanjiku,0791654489,Nairobi,AG003,CBD Traders,CBD,deposit,4120
TX00568,2024-05-17 12:53,DUNCAN ACHIENG,0757533891,Kisumu,AG005,Ahero Traders,Ahero,send,3600
TX00569,2024-05-17 14:34,Otieno Kiprop,0794761775,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,4440
TX00570,2024-05-17 18:56,SAMUEL WANJIKU,0776897241,Kisumu,AG002,Githurai Mobile Shop,Githurai,deposit,630
TX00571,2024-05-18 04:18,George Wanjiku,0745870866,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,3000
TX00572,2024-05-18 07:32,Otieno Ali,254796532173,Nakuru,AG012,Othaya Mobile Shop,Othaya,deposit,470
TX00573,2024-05-18 12:33,Amina Omondi,0734657335,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,1450
TX00574,2024-05-19 01:34,Ruth Mutua,0749753097,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,1540
TX00575,2024-05-19 02:19,Ruth Kiprop,0717570364,Nairobi,AG003,CBD Traders,CBD,withdrawal,600
TX00576,2024-05-19 08:10,Tabitha Omondi,0799935367,Kakamega,AG005,Ahero Traders,Ahero,deposit,370
TX00577,2024-05-19 09:59,James Chebet,0783445203,Nairobi,AG003,CBD Traders,CBD,deposit,2270
TX00578,2024-05-20 08:05,Amina Omondi,0730800514,Kisumu,AG007,Molo Mobile Shop,Molo,send,2190
TX00579,2024-05-20 10:04,Kevin Nyambura,0768987947,Kisumu,AG004,Kondele Traders,Kondele,send,830
TX00580,2024-05-20 23:45,Quincy Kiprop,+254767945672,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,4130
TX00581,2024-05-21 02:28,Amina Omondi,+254734657335,Nyeri,AG008,Likoni Agency,Likoni,withdrawal,7040
TX00582,2024-05-21 03:00,Ruth Kiprop,+254781162841,Mombasa,AG009,Changamwe Electronics,Changamwe,send,980
TX00583,2024-05-21 04:55,Achieng Njoroge,0770692216,Kakamega,AG010,Mumias Agency,Mumias,deposit,3030
TX00584,2024-05-21 06:30,Lucy Mwangi,+254796705311,Nyeri,AG011,Karatina Traders,Karatina,deposit,1430
TX00585,2024-05-21 08:25,Otieno Njoroge,0792922794,Kakamega,AG010,Mumias Agency,Mumias,deposit,2010
TX00586,2024-05-21 12:57,Ruth Kamau,0755338137,Mombasa,AG008,Likoni Agency,Likoni,send,470
TX00587,2024-05-21 14:28,Ruth Mwangi,0735434684,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,840
TX00588,2024-05-21 14:54,Esther Omondi,0721708124,Nyeri,AG003,CBD Traders,CBD,deposit,1100
TX00589,2024-05-21 20:37,Kevin Odhiambo,0793945277,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,3410
TX00590,2024-05-21 22:19,Samuel Ali,0735580256,Kakamega,AG010,Mumias Agency,Mumias,send,150
TX00591,2024-05-21 22:54,QUINCY MUTUA,0796494933,Nairobi,AG003,CBD Traders,CBD,withdrawal,1230
TX00592,2024-05-22 13:24,Daniel Kamau,0757110322,Kisumu,AG004,Kondele Traders,Kondele,send,1830
TX00593,2024-05-22 16:23,WANJIRU KARIUKI,254713702236,Nyeri,AG011,Karatina Traders,Karatina,withdrawal,500
TX00594,2024-05-23 06:15,Lucy Otieno,0782207908,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1690
TX00595,2024-05-23 09:34,James Kiprop,0743585965,Nakuru,AG005,Ahero Traders,Ahero,deposit,1180
TX00596,2024-05-23 14:47,Esther Achieng,+254778860702,Mombasa,AG005,Ahero Traders,Ahero,deposit,4660
TX00597,2024-05-23 20:29,Zawadi Mutua,0780424966,Kisumu,AG005,Ahero Traders,Ahero,send,1390
TX00598,2024-05-24 09:00,Wanjiru Ali,0717521064,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1990
TX00599,2024-05-24 21:37,VICTOR NYAMBURA,0782470004,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,550
TX00600,2024-05-25 04:30,Samuel Chebet,0781181137,Nairobi,AG001,Kibera Agency,Kibera,send,2440
TX00601,2024-05-25 12:42,SAMUEL NJOROGE,+254758932135,Kisumu,AG007,Molo Mobile Shop,Molo,deposit,2160
TX00602,2024-05-25 15:22,Peter Wafula,0741815015,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,3870
TX00603,2024-05-25 18:53,Yusuf Otieno,0747751577,Nyeri,AG011,Karatina Traders,Karatina,deposit,2290
TX00604,2024-05-26 02:51,Peter Otieno,0756906200,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,1520
TX00605,2024-05-26 03:17,Samuel Njoroge,+254758932135,Kisumu,AG004,Kondele Traders,Kondele,send,2450
TX00606,2024-05-26 14:17,Duncan Omondi,0761565061,Kisumu,AG005,Ahero Traders,Ahero,deposit,1620
TX00607,2024-05-26 23:41,Kevin Odhiambo,0724934058,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1890
TX00608,2024-05-27 11:45,Brian Ali,254777540098,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,4960
TX00609,2024-05-27 12:41,Peter Mutua,+254758527453,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,3440
TX00610,2024-05-27 12:43,Kevin Nyambura,0768987947,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1990
TX00611,2024-05-27 12:58,Samuel Kamau,+254797288130,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1390
TX00612,2024-05-27 19:38,Samuel Wanjiku,0757133398,Nairobi,AG003,CBD Traders,CBD,deposit,8940
TX00613,2024-05-27 19:40,Ruth Kiprop,254717570364,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,1500
TX00614,2024-05-28 16:22,Esther Chebet,0732335804,Kisumu,AG007,Molo Mobile Shop,Molo,withdrawal,1740
TX00615,2024-05-28 18:51,SAMUEL ALI,254735580256,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2210
TX00616,2024-05-29 07:02,Peter Kiprop,+254723642023,Nyeri,AG005,Ahero Traders,Ahero,deposit,3700
TX00617,2024-05-29 07:41,Quincy Achieng,0740454092,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,2190
TX00618,2024-05-29 08:29,Samuel Otieno,0769424257,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,180
TX00619,2024-05-29 23:34,Yusuf Njoroge,0781698656,Mombasa,AG009,Changamwe Electronics,Changamwe,send,90
TX00620,2024-05-30 06:59,Otieno Wanjiku,0739912527,Kisumu,AG004,Kondele Traders,Kondele,deposit,3200
TX00621,2024-05-30 07:46,Faith Achieng,0792159270,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,4950
TX00622,2024-05-30 12:22,Ruth Kiprop,0781162841,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1010
TX00623,2024-05-31 01:01,Faith Chebet,+254770855361,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,3380
TX00624,2024-05-31 02:02,Duncan Achieng,0757533891,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1510
TX00625,2024-05-31 05:48,Otieno Wanjiku,0768497889,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,540
TX00626,2024-05-31 08:22,Tabitha Wanjiku,0791654489,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,2300
TX00627,2024-06-01 02:12,Daniel Kiprop,0798585568,Nairobi,AG012,Othaya Mobile Shop,Othaya,send,3290
TX00628,2024-06-01 04:26,Quincy Mutua,0796494933,Nairobi,AG003,CBD Traders,CBD,deposit,320
TX00629,2024-06-01 05:27,Tabitha Otieno,0768320549,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,570
TX00630,2024-06-01 10:37,Otieno Odhiambo,0748664970,Nairobi,AG003,CBD Traders,CBD,withdrawal,1250
TX00631,2024-06-01 12:10,Otieno Otieno,+254714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,500
TX00632,2024-06-01 23:49,Yusuf Omondi,0738858153,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,330
TX00633,2024-06-02 06:12,Zawadi Odhiambo,0715527223,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,950
TX00634,2024-06-03 14:34,Emmanuel Wafula,0778528369,Kisumu,AG004,Kondele Traders,Kondele,deposit,1100
TX00635,2024-06-03 14:56,Kevin Kariuki,+254791950138,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1570
TX00636,2024-06-03 15:41,Mercy Kiprop,0768729052,Kakamega,AG010,Mumias Agency,Mumias,send,2980
TX00637,2024-06-03 18:48,Cynthia Odhiambo,0763710064,Nyeri,AG011,Karatina Traders,Karatina,send,2940
TX00638,2024-06-03 20:50,Achieng Njoroge,0770692216,Kakamega,AG009,Changamwe Electronics,Changamwe,send,270
TX00639,2024-06-04 02:13,Samuel Njoroge,+254758932135,Kisumu,AG005,Ahero Traders,Ahero,send,1920
TX00640,2024-06-04 08:58,James Omondi,0766457955,Nairobi,AG003,CBD Traders,CBD,deposit,1420
TX00641,2024-06-04 20:37,Tabitha Wanjiku,0791654489,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,490
TX00642,2024-06-05 03:33,Emmanuel Wafula,0778528369,Kisumu,AG005,Ahero Traders,Ahero,deposit,340
TX00643,2024-06-05 04:55,Otieno Otieno,0714603379,Mombasa,AG011,Karatina Traders,Karatina,send,1000
TX00644,2024-06-05 08:46,Brian Njoroge,0790876010,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,2540
TX00645,2024-06-05 08:47,Tabitha Omondi,0799935367,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,680
TX00646,2024-06-05 10:54,George Kariuki,254779950911,Kisumu,AG009,Changamwe Electronics,Changamwe,send,610
TX00647,2024-06-05 13:51,Tabitha Ali,0714969608,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,2850
TX00648,2024-06-06 01:12,Brian Chebet,0735785667,Nyeri,AG005,Ahero Traders,Ahero,withdrawal,3300
TX00649,2024-06-06 09:52,Cynthia Njoroge,0742670375,Nairobi,AG001,Kibera Agency,Kibera,deposit,760
TX00650,2024-06-06 09:55,Ruth Mutua,+254749753097,Mombasa,AG008,Likoni Agency,Likoni,deposit,850
TX00651,2024-06-06 12:22,Zawadi Mutua,0734425622,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,930
TX00652,2024-06-06 12:44,Otieno Ali,254796532173,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,3010
TX00653,2024-06-06 16:15,Esther Ali,+254717258033,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1420
TX00654,2024-06-06 18:46,Wanjiru Mwangi,0739166890,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,530
TX00655,2024-06-06 20:58,Otieno Otieno,0714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,670
TX00656,2024-06-06 23:11,Zawadi Ali,0738550009,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1240
TX00657,2024-06-07 01:30,Yusuf Ali,254732456072,Kisumu,AG005,Ahero Traders,Ahero,deposit,1160
TX00658,2024-06-07 04:13,Tabitha Otieno,0768320549,Mombasa,AG008,Likoni Agency,Likoni,send,940
TX00659,2024-06-07 09:10,Kevin Kamau,254786124492,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,3390
TX00660,2024-06-07 23:41,Peter Kiprop,+254723642023,Nyeri,AG010,Mumias Agency,Mumias,deposit,5720
TX00661,2024-06-08 01:45,Njeri Odhiambo,0761137549,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,3040
TX00662,2024-06-08 22:57,Samuel Kamau,254797288130,Kisumu,AG004,Kondele Traders,Kondele,send,1040
TX00663,2024-06-09 14:23,Kevin Odhiambo,0789485143,Kakamega,AG010,Mumias Agency,Mumias,deposit,6550
TX00664,2024-06-09 14:58,Tabitha Ali,0714969608,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,2450
TX00665,2024-06-09 17:18,Wanjiru Kiprop,0730762633,Nairobi,AG001,Kibera Agency,Kibera,send,1780
TX00666,2024-06-10 00:39,Samuel Wanjiku,0757133398,Nairobi,AG001,Kibera Agency,Kibera,deposit,1050
TX00667,2024-06-10 18:00,Duncan Achieng,254757533891,Kisumu,AG004,Kondele Traders,Kondele,deposit,2670
TX00668,2024-06-10 18:23,Brian Chebet,0724749319,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,4790
TX00669,2024-06-11 00:55,Wanjiru Kiprop,0730762633,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,2390
TX00670,2024-06-11 02:25,Ruth Mwangi,+254735434684,Nakuru,AG006,Naivasha Electronics,Naivasha,send,2520
TX00671,2024-06-11 21:46,Samuel Achieng,254732521987,Kakamega,AG006,Naivasha Electronics,Naivasha,deposit,2340
TX00672,2024-06-12 03:13,Otieno Mutua,0793658336,Mombasa,AG008,Likoni Agency,Likoni,send,180
TX00673,2024-06-12 03:25,Njeri Otieno,+254782710955,Nairobi,AG001,Kibera Agency,Kibera,deposit,1170
TX00674,2024-06-12 14:34,Victor Nyambura,254792481430,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2630
TX00675,2024-06-12 18:33,Quincy Achieng,0740454092,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1920
TX00676,2024-06-12 20:17,Wanjiru Ali,0717521064,Mombasa,AG008,Likoni Agency,Likoni,send,2510
TX00677,2024-06-13 03:14,Ruth Kiprop,0717570364,Nairobi,AG001,Kibera Agency,Kibera,deposit,380
TX00678,2024-06-13 06:11,Samuel Ali,0735580256,Kakamega,AG010,Mumias Agency,Mumias,deposit,1660
TX00679,2024-06-13 09:19,Umi Odhiambo,0789104220,Kisumu,AG004,Kondele Traders,Kondele,deposit,2230
TX00680,2024-06-13 11:40,Kevin Kamau,+254786124492,Nakuru,AG007,Molo Mobile Shop,Molo,send,430
TX00681,2024-06-13 17:38,Yusuf Ali,0732456072,Kisumu,AG004,Kondele Traders,Kondele,deposit,1540
TX00682,2024-06-13 22:55,Tabitha Wanjiku,+254791654489,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,2390
TX00683,2024-06-14 00:12,Tabitha Otieno,+254768320549,Mombasa,AG008,Likoni Agency,Likoni,deposit,1410
TX00684,2024-06-14 00:50,Emmanuel Omondi,0725380344,Nakuru,AG005,Ahero Traders,Ahero,send,3370
TX00685,2024-06-14 16:37,Victor Nyambura,0792481430,Kakamega,AG010,Mumias Agency,Mumias,send,1170
TX00686,2024-06-14 16:55,Faith Achieng,0792159270,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,960
TX00687,2024-06-15 11:53,Peter Otieno,0756906200,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,1280
TX00688,2024-06-15 19:02,Otieno Odhiambo,+254748664970,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,7040
TX00689,2024-06-15 20:35,Yusuf Achieng,254718327276,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,3130
TX00690,2024-06-15 21:38,Otieno Wanjiku,0739912527,Kisumu,AG004,Kondele Traders,Kondele,send,1280
TX00691,2024-06-16 02:25,Amina Omondi,0730800514,Kisumu,AG005,Ahero Traders,Ahero,send,240
TX00692,2024-06-16 09:16,Ruth Mwangi,0735434684,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,3080
TX00693,2024-06-16 13:07,Quincy Achieng,0740454092,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,3160
TX00694,2024-06-17 05:00,Wanjiru Kariuki,+254713702236,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,1020
TX00695,2024-06-17 06:20,Otieno Wanjiku,0768497889,Nyeri,AG011,Karatina Traders,Karatina,deposit,1830
TX00696,2024-06-17 11:27,Ruth Mutua,0749753097,Mombasa,AG008,Likoni Agency,Likoni,deposit,2930
TX00697,2024-06-17 12:56,Peter Mutua,0758527453,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1670
TX00698,2024-06-17 13:42,James Achieng,0724507260,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,3910
TX00699,2024-06-18 01:49,Ruth Mutua,0749753097,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,3070
TX00700,2024-06-18 07:26,Njeri Odhiambo,+254761137549,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1400
TX00701,2024-06-18 15:18,WANJIRU MWANGI,254739166890,Kisumu,AG004,Kondele Traders,Kondele,deposit,4370
TX00702,2024-06-18 18:47,Victor Mutua,0794959393,Mombasa,AG008,Likoni Agency,Likoni,deposit,1290
TX00703,2024-06-19 20:18,Faith Chebet,0765596236,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1910
TX00704,2024-06-19 21:31,Emmanuel Mutua,0777249423,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,1810
TX00705,2024-06-21 03:22,Cynthia Otieno,0798918869,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1280
TX00706,2024-06-21 05:32,Irene Otieno,0775963806,Nakuru,AG009,Changamwe Electronics,Changamwe,deposit,7930
TX00707,2024-06-21 08:27,Tabitha Otieno,+254787970492,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,3330
TX00708,2024-06-21 15:47,Tabitha Kariuki,0712826756,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1880
TX00709,2024-06-21 22:16,James Kiprop,0743585965,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,5200
TX00710,2024-06-22 08:29,Chebet Kiprop,0744309985,Nyeri,AG004,Kondele Traders,Kondele,deposit,7160
TX00711,2024-06-22 10:16,Tabitha Odhiambo,+254722804395,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,3590
TX00712,2024-06-23 00:41,Brian Njoroge,+254790876010,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1330
TX00713,2024-06-23 03:40,Njeri Kiprop,0752888749,Kakamega,AG010,Mumias Agency,Mumias,deposit,1240
TX00714,2024-06-23 04:54,Brian Chebet,+254724749319,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,450
TX00715,2024-06-23 04:57,Yusuf Omondi,0738858153,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,7860
TX00716,2024-06-23 09:56,Samuel Wanjiku,0757133398,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,1900
TX00717,2024-06-23 12:36,Kevin Kamau,0786124492,Nakuru,AG006,Naivasha Electronics,Naivasha,send,740
TX00718,2024-06-23 17:03,Zawadi Omondi,0732701953,Kakamega,AG010,Mumias Agency,Mumias,send,1480
TX00719,2024-06-23 21:24,James Kiprop,0743585965,Nakuru,AG004,Kondele Traders,Kondele,deposit,2800
TX00720,2024-06-24 04:47,ESTHER ALI,0778898676,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,1300
TX00721,2024-06-24 08:28,Zawadi Mutua,+254780424966,Kisumu,AG011,Karatina Traders,Karatina,withdrawal,4670
TX00722,2024-06-24 14:12,Achieng Njoroge,0770692216,Kakamega,AG007,Molo Mobile Shop,Molo,withdrawal,2190
TX00723,2024-06-24 15:04,Chebet Kamau,+254774759708,Kisumu,AG005,Ahero Traders,Ahero,deposit,2030
TX00724,2024-06-25 01:31,Duncan Omondi,0761565061,Kisumu,AG005,Ahero Traders,Ahero,send,740
TX00725,2024-06-25 05:10,Tabitha Otieno,0768320549,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,2300
TX00726,2024-06-25 05:11,Ruth Kiprop,254717570364,Nairobi,AG004,Kondele Traders,Kondele,withdrawal,1380
TX00727,2024-06-25 06:08,Irene Otieno,0775963806,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,8750
TX00728,2024-06-25 06:28,Kevin Kariuki,+254791950138,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,4060
TX00729,2024-06-25 18:40,James Chebet,0783445203,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,3880
TX00730,2024-06-26 06:52,Zawadi Kariuki,0758808790,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,2240
TX00731,2024-06-26 10:05,Brian Njoroge,0790876010,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1690
TX00732,2024-06-27 05:47,Ruth Ali,0768594225,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,2810
TX00733,2024-06-27 06:20,Otieno Kiprop,0794761775,Kisumu,AG004,Kondele Traders,Kondele,deposit,2280
TX00734,2024-06-27 08:21,Quincy Achieng,0740454092,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,3200
TX00735,2024-06-27 14:39,Victor Nyambura,0792481430,Kakamega,AG010,Mumias Agency,Mumias,send,1610
TX00736,2024-06-28 01:34,Emmanuel Kiprop,+254766332024,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,5420
TX00737,2024-06-28 02:23,Zawadi Kariuki,0758808790,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,1310
TX00738,2024-06-28 21:24,Esther Ali,0717258033,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1370
TX00739,2024-06-29 04:38,Duncan Achieng,+254757533891,Kisumu,AG004,Kondele Traders,Kondele,deposit,4090
TX00740,2024-06-29 05:25,Kevin Ali,0736810718,Nairobi,AG003,CBD Traders,CBD,deposit,500
TX00741,2024-06-29 18:02,Ruth Kamau,0755338137,Mombasa,AG008,Likoni Agency,Likoni,deposit,2230
TX00742,2024-06-29 20:45,Zawadi Omondi,0732701953,Kakamega,AG010,Mumias Agency,Mumias,deposit,450
TX00743,2024-06-30 01:41,Mercy Kiprop,0768729052,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,3100
TX00744,2024-06-30 02:23,Cynthia Kamau,0746618936,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,2510
TX00745,2024-06-30 07:54,Otieno Otieno,+254714603379,Mombasa,AG008,Likoni Agency,Likoni,deposit,1020
TX00746,2024-06-30 15:26,Wanjiru Ali,0717521064,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,3740
TX00747,2024-06-30 20:46,Wanjiru Kariuki,0713702236,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,2720
TX00748,2024-07-01 03:04,Njeri Kiprop,+254752888749,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,870
TX00749,2024-07-01 04:55,Zawadi Odhiambo,0715527223,Kakamega,AG010,Mumias Agency,Mumias,deposit,1690
TX00750,2024-07-01 06:11,Samuel Achieng,0732521987,Kakamega,AG010,Mumias Agency,Mumias,deposit,630
TX00751,2024-07-01 07:18,James Omondi,+254766457955,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,3250
TX00752,2024-07-01 10:48,Amina Ali,254751100442,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,710
TX00753,2024-07-01 11:18,Brian Ali,0758236176,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,1950
TX00754,2024-07-01 12:02,Zawadi Kariuki,254758808790,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,4210
TX00755,2024-07-02 07:39,Yusuf Ali,0732456072,Kisumu,AG004,Kondele Traders,Kondele,deposit,860
TX00756,2024-07-02 08:40,Peter Kiprop,0723642023,Nyeri,AG011,Karatina Traders,Karatina,send,510
TX00757,2024-07-02 10:55,Ruth Wafula,0717982346,Nyeri,AG010,Mumias Agency,Mumias,withdrawal,1910
TX00758,2024-07-02 12:24,Samuel Nyambura,0729502561,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,570
TX00759,2024-07-02 14:08,Emmanuel Wafula,254778528369,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,840
TX00760,2024-07-02 20:45,Esther Omondi,0721708124,Nyeri,AG011,Karatina Traders,Karatina,deposit,7380
TX00761,2024-07-03 01:19,Irene Njoroge,0783442361,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1350
TX00762,2024-07-03 12:01,Mercy Kiprop,0768729052,Kakamega,AG010,Mumias Agency,Mumias,deposit,2260
TX00763,2024-07-03 13:32,George Wafula,0745274138,Mombasa,AG008,Likoni Agency,Likoni,send,710
TX00764,2024-07-03 18:33,Irene Otieno,+254775963806,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1180
TX00765,2024-07-04 04:47,Zawadi Ali,0738550009,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,2180
TX00766,2024-07-04 06:10,Tabitha Otieno,0768320549,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,620
TX00767,2024-07-04 08:47,James Mutua,0745468032,Kakamega,AG010,Mumias Agency,Mumias,deposit,1580
TX00768,2024-07-04 13:47,Cynthia Wanjiku,0757336174,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1330
TX00769,2024-07-04 23:24,Cynthia Kamau,0746618936,Nairobi,AG011,Karatina Traders,Karatina,send,1420
TX00770,2024-07-05 03:34,Peter Wafula,0741815015,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,1940
TX00771,2024-07-05 04:36,George Omondi,0738982885,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1060
TX00772,2024-07-05 07:37,Lucy Mwangi,0738773451,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,300
TX00773,2024-07-05 08:11,Quincy Kiprop,0767945672,Mombasa,AG008,Likoni Agency,Likoni,deposit,3360
TX00774,2024-07-05 08:15,Samuel Otieno,0769424257,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,3460
TX00775,2024-07-05 10:35,Zawadi Omondi,+254732701953,Kakamega,AG010,Mumias Agency,Mumias,deposit,1610
TX00776,2024-07-05 10:42,Cynthia Kamau,0746618936,Nairobi,AG001,Kibera Agency,Kibera,deposit,890
TX00777,2024-07-05 10:49,George Wanjiku,0745870866,Nairobi,AG003,CBD Mega Agency,CBD,send,1580
TX00778,2024-07-05 17:09,Lucy Nyambura,0783896326,Nakuru,AG007,Molo Mobile Shop,Molo,send,2490
TX00779,2024-07-05 21:12,Chebet Nyambura,+254745155401,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1470
TX00780,2024-07-06 06:32,Quincy Mutua,0796494933,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,2550
TX00781,2024-07-06 07:57,Kevin Odhiambo,254789485143,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,8800
TX00782,2024-07-06 15:53,George Kariuki,0779950911,Kisumu,AG009,Changamwe Electronics,Changamwe,deposit,460
TX00783,2024-07-06 19:13,Ruth Wafula,0717982346,Nyeri,AG011,Karatina Traders,Karatina,deposit,2400
TX00784,2024-07-07 12:02,Samuel Wanjiku,0757133398,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,930
TX00785,2024-07-07 14:15,Achieng Kamau,0715656728,Nyeri,AG011,Karatina Traders,Karatina,send,500
TX00786,2024-07-07 14:27,Njeri Odhiambo,0761137549,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,1850
TX00787,2024-07-07 14:32,Wanjiru Nyambura,0710343706,Kisumu,AG004,Kondele Traders,Kondele,send,610
TX00788,2024-07-07 15:04,Amina Omondi,254730800514,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,3130
TX00789,2024-07-08 04:29,Emmanuel Wafula,0778528369,Kisumu,AG004,Kondele Traders,Kondele,deposit,460
TX00790,2024-07-08 08:01,DANIEL KAMAU,254757110322,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2980
TX00791,2024-07-08 21:56,Lucy Otieno,0782207908,Kakamega,AG010,Mumias Agency,Mumias,deposit,8590
TX00792,2024-07-08 22:20,Zawadi Omondi,0732701953,Kakamega,AG010,Mumias Agency,Mumias,send,340
TX00793,2024-07-08 22:56,Emmanuel Wafula,+254778528369,Kisumu,AG004,Kondele Traders,Kondele,send,4960
TX00794,2024-07-09 16:01,Duncan Omondi,0761565061,Kisumu,AG004,Kondele Traders,Kondele,deposit,3340
TX00795,2024-07-09 16:19,Yusuf Odhiambo,254713732630,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,2260
TX00796,2024-07-09 18:35,George Wafula,254745274138,Mombasa,AG008,Likoni Agency,Likoni,send,1620
TX00797,2024-07-09 21:09,Irene Otieno,+254775963806,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,2640
TX00798,2024-07-10 14:27,Cynthia Wanjiku,0757336174,Kisumu,AG008,Likoni Agency,Likoni,send,600
TX00799,2024-07-10 18:00,Tabitha Mutua,0756826189,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,520
TX00800,2024-07-10 23:33,Emmanuel Mutua,0777249423,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,6060
TX00801,2024-07-11 03:43,Amina Omondi,0730800514,Kisumu,AG005,Ahero Traders,Ahero,send,1360
TX00802,2024-07-11 06:49,Samuel Ali,0735580256,Kakamega,AG006,Naivasha Electronics,Naivasha,deposit,5220
TX00803,2024-07-11 09:33,James Omondi,254766457955,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,1910
TX00804,2024-07-11 10:01,Umi Odhiambo,0789104220,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,6160
TX00805,2024-07-11 20:52,Ruth Kiprop,0781162841,Mombasa,AG009,Changamwe Electronics,Changamwe,send,2740
TX00806,2024-07-12 00:00,Yusuf Njoroge,0781698656,Mombasa,AG008,Likoni Agency,Likoni,send,1970
TX00807,2024-07-12 12:26,Brian Chebet,0724749319,Kisumu,AG005,Ahero Traders,Ahero,deposit,590
TX00808,2024-07-13 02:46,Duncan Omondi,0761565061,Kisumu,AG005,Ahero Traders,Ahero,deposit,1180
TX00809,2024-07-13 17:15,Amina Omondi,254730800514,Kisumu,AG004,Kondele Traders,Kondele,deposit,3920
TX00810,2024-07-13 22:53,Tabitha Kariuki,0712826756,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,3150
TX00811,2024-07-14 09:46,Otieno Wanjiku,0768497889,Nyeri,AG011,Karatina Traders,Karatina,withdrawal,5840
TX00812,2024-07-15 00:02,Kevin Odhiambo,+254793945277,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,2080
TX00813,2024-07-15 06:08,TABITHA ODHIAMBO,0722804395,Kisumu,AG005,Ahero Traders,Ahero,deposit,3270
TX00814,2024-07-15 07:32,Otieno Wanjiku,0739912527,Kisumu,AG005,Ahero Traders,Ahero,deposit,5010
TX00815,2024-07-16 03:00,Kevin Nyambura,0768987947,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1940
TX00816,2024-07-16 05:57,Tabitha Odhiambo,0722804395,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1890
TX00817,2024-07-16 06:23,Yusuf Omondi,0738858153,Nairobi,AG001,Kibera Agency,Kibera,send,220
TX00818,2024-07-16 07:12,Tabitha Otieno,+254787970492,Kakamega,AG010,Mumias Agency,Mumias,deposit,4760
TX00819,2024-07-16 12:23,Quincy Kiprop,+254767945672,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,810
TX00820,2024-07-16 16:57,Chebet Kamau,254774759708,Kisumu,AG005,Ahero Traders,Ahero,send,930
TX00821,2024-07-16 23:06,LUCY NYAMBURA,0783896326,Nakuru,AG006,Naivasha Electronics,Naivasha,send,900
TX00822,2024-07-17 03:47,Yusuf Otieno,254747751577,Nyeri,AG011,Karatina Traders,Karatina,deposit,1260
TX00823,2024-07-17 06:47,Kevin Nyambura,0768987947,Kisumu,AG005,Ahero Traders,Ahero,deposit,3650
TX00824,2024-07-17 22:49,Cynthia Otieno,0798918869,Mombasa,AG008,Likoni Agency,Likoni,deposit,2070
TX00825,2024-07-17 22:57,Quincy Achieng,+254740454092,Mombasa,AG008,Likoni Agency,Likoni,send,610
TX00826,2024-07-18 01:37,Brian Ali,0777540098,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1970
TX00827,2024-07-18 04:38,Brian Ali,+254758236176,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,1340
TX00828,2024-07-18 09:10,Tabitha Kariuki,0712826756,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,5110
TX00829,2024-07-18 15:15,Njeri Kiprop,0752888749,Kakamega,AG010,Mumias Agency,Mumias,deposit,1850
TX00830,2024-07-18 21:42,Wanjiru Kariuki,0713702236,Nyeri,AG009,Changamwe Electronics,Changamwe,send,1030
TX00831,2024-07-19 04:12,GEORGE KARIUKI,0779950911,Kisumu,AG005,Ahero Traders,Ahero,deposit,1440
TX00832,2024-07-19 07:18,YUSUF ACHIENG,254718327276,Nairobi,AG003,CBD Mega Agency,CBD,deposit,1400
TX00833,2024-07-19 11:47,Mercy Nyambura,0747913516,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,600
TX00834,2024-07-19 14:31,Victor Mutua,0794959393,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,3090
TX00835,2024-07-20 02:11,Duncan Omondi,+254761565061,Kisumu,AG004,Kondele Traders,Kondele,deposit,5140
TX00836,2024-07-20 02:36,Amina Omondi,0730800514,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,450
TX00837,2024-07-20 04:36,Daniel Kiprop,+254798585568,Nairobi,AG003,CBD Mega Agency,CBD,deposit,4500
TX00838,2024-07-20 04:46,Samuel Nyambura,0729502561,Kakamega,AG007,Molo Mobile Shop,Molo,deposit,580
TX00839,2024-07-20 06:16,Wanjiru Kariuki,0713702236,Nyeri,AG004,Kondele Traders,Kondele,deposit,780
TX00840,2024-07-20 09:19,Baraka Kariuki,0752974991,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,730
TX00841,2024-07-20 12:54,Wanjiru Kiprop,0730762633,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,4180
TX00842,2024-07-20 22:43,Njeri Otieno,0782710955,Nairobi,AG009,Changamwe Electronics,Changamwe,deposit,2430
TX00843,2024-07-21 07:50,Wanjiru Kariuki,0713702236,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,410
TX00844,2024-07-21 09:26,Yusuf Otieno,0747751577,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,660
TX00845,2024-07-21 13:38,Wanjiru Nyambura,+254710343706,Kisumu,AG005,Ahero Traders,Ahero,send,460
TX00846,2024-07-22 04:07,Yusuf Njoroge,0781698656,Mombasa,AG008,Likoni Agency,Likoni,deposit,4620
TX00847,2024-07-22 09:37,Quincy Omondi,254796921408,Mombasa,AG008,Likoni Agency,Likoni,send,370
TX00848,2024-07-22 20:17,Kevin Odhiambo,0724934058,Mombasa,AG008,Likoni Agency,Likoni,send,4140
TX00849,2024-07-23 06:04,Faith Chebet,0765596236,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,2390
TX00850,2024-07-23 06:40,Otieno Kiprop,0794761775,Kisumu,AG004,Kondele Traders,Kondele,send,780
TX00851,2024-07-23 12:22,Victor Mutua,0794959393,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,4810
TX00852,2024-07-23 16:28,Daniel Kiprop,0798585568,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,360
TX00853,2024-07-23 18:49,Samuel Wanjiku,0757133398,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,1670
TX00854,2024-07-24 00:55,Amina Kariuki,0780857257,Nakuru,AG007,Molo Mobile Shop,Molo,send,1490
TX00855,2024-07-24 07:04,Tabitha Omondi,0799935367,Kakamega,AG010,Mumias Agency,Mumias,send,300
TX00856,2024-07-24 10:08,Otieno Wanjiku,0739912527,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,6140
TX00857,2024-07-24 10:09,Samuel Omondi,254773701385,Kisumu,AG005,Ahero Traders,Ahero,deposit,1690
TX00858,2024-07-24 10:59,Victor Nyambura,0792481430,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2580
TX00859,2024-07-24 11:51,Tabitha Kariuki,+254712826756,Nakuru,AG010,Mumias Agency,Mumias,deposit,1360
TX00860,2024-07-24 15:07,Tabitha Ali,0714969608,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,530
TX00861,2024-07-24 19:17,Ruth Kamau,0755338137,Mombasa,AG008,Likoni Agency,Likoni,deposit,5650
TX00862,2024-07-24 20:16,Daniel Kamau,+254757110322,Kisumu,AG004,Kondele Traders,Kondele,deposit,1370
TX00863,2024-07-24 22:11,Yusuf Odhiambo,0713732630,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,1510
TX00864,2024-07-25 08:18,Brian Ali,0777540098,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,1660
TX00865,2024-07-25 10:20,James Chebet,0783445203,Nairobi,AG001,Kibera Agency,Kibera,send,3200
TX00866,2024-07-25 10:43,Tabitha Mutua,+254756826189,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1870
TX00867,2024-07-25 12:33,Quincy Mutua,0796494933,Nairobi,AG001,Kibera Agency,Kibera,deposit,5930
TX00868,2024-07-25 20:30,Cynthia Otieno,0798918869,Mombasa,AG008,Likoni Agency,Likoni,deposit,1040
TX00869,2024-07-26 06:18,CYNTHIA WANJIKU,0757336174,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2820
TX00870,2024-07-27 08:48,Mercy Nyambura,0747913516,Kisumu,AG004,Kondele Traders,Kondele,send,5240
TX00871,2024-07-27 09:00,Zawadi Mutua,254734425622,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,910
TX00872,2024-07-27 16:07,Lucy Nyambura,0783896326,Nakuru,AG007,Molo Mobile Shop,Molo,send,1600
TX00873,2024-07-27 19:07,Wanjiru Kiprop,+254730762633,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1520
TX00874,2024-07-28 09:41,Esther Ali,0778898676,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,710
TX00875,2024-07-28 09:55,Brian Ali,0777540098,Mombasa,AG008,Likoni Agency,Likoni,send,1040
TX00876,2024-07-28 10:59,ESTHER ALI,0778898676,Nairobi,AG006,Naivasha Electronics,Naivasha,deposit,3580
TX00877,2024-07-28 18:13,Ruth Mutua,0765990081,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,1410
TX00878,2024-07-28 18:23,Emmanuel Omondi,254725380344,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,830
TX00879,2024-07-29 01:34,Quincy Kiprop,+254767945672,Mombasa,AG007,Molo Mobile Shop,Molo,deposit,1410
TX00880,2024-07-29 12:54,Yusuf Omondi,254738858153,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,6860
TX00881,2024-07-29 19:36,Kevin Nyambura,0768987947,Kisumu,AG004,Kondele Traders,Kondele,deposit,4370
TX00882,2024-07-30 13:07,Ruth Mwangi,+254735434684,Nakuru,AG007,Molo Mobile Shop,Molo,send,280
TX00883,2024-07-30 17:55,Esther Ali,0717258033,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,3260
TX00884,2024-07-30 21:50,Faith Chebet,0765596236,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,4260
TX00885,2024-07-31 00:13,Samuel Wanjiku,0776897241,Kisumu,AG005,Ahero Traders,Ahero,deposit,5660
TX00886,2024-07-31 03:19,Chebet Nyambura,+254745155401,Kakamega,AG010,Mumias Agency,Mumias,send,820
TX00887,2024-07-31 12:17,Otieno Mutua,0793658336,Mombasa,AG009,Changamwe Electronics,Changamwe,send,3370
TX00888,2024-07-31 14:13,Tabitha Mutua,0756826189,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,4150
TX00889,2024-07-31 15:11,Cynthia Kamau,+254746618936,Nairobi,AG001,Kibera Agency,Kibera,deposit,2990
TX00890,2024-07-31 18:30,Chebet Kiprop,0744309985,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,2820
TX00891,2024-08-01 14:37,Baraka Kariuki,+254752974991,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,2640
TX00892,2024-08-01 18:44,Faith Achieng,0792159270,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,1430
TX00893,2024-08-02 01:12,Faith Chebet,0765596236,Nakuru,AG006,Naivasha Electronics,Naivasha,send,1450
TX00894,2024-08-02 14:21,RUTH ALI,254792588118,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,480
TX00895,2024-08-02 15:44,Zawadi Odhiambo,0715527223,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,4670
TX00896,2024-08-02 19:06,Lucy Mwangi,0738773451,Kakamega,AG010,Mumias Agency,Mumias,deposit,1070
TX00897,2024-08-03 08:25,Wanjiru Nyambura,0710343706,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,6130
TX00898,2024-08-03 10:58,Duncan Achieng,0757533891,Kisumu,AG004,Kondele Traders,Kondele,send,660
TX00899,2024-08-03 17:24,Tabitha Nyambura,0723654616,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,4910
TX00900,2024-08-03 20:14,Otieno Mutua,0793658336,Mombasa,AG004,Kondele Traders,Kondele,send,760
TX00901,2024-08-03 22:09,Tabitha Kariuki,0712826756,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,3510
TX00902,2024-08-04 02:12,Ruth Kiprop,+254781162841,Mombasa,AG008,Likoni Agency,Likoni,deposit,610
TX00903,2024-08-04 04:41,Otieno Mutua,+254793658336,Mombasa,AG008,Likoni Agency,Likoni,send,2840
TX00904,2024-08-04 09:32,Ruth Kiprop,0717570364,Nairobi,AG010,Mumias Agency,Mumias,withdrawal,550
TX00905,2024-08-04 19:32,Faith Chebet,0765596236,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,750
TX00906,2024-08-05 02:46,Samuel Wanjiku,+254776897241,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1480
TX00907,2024-08-05 04:47,Baraka Kariuki,0752974991,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1800
TX00908,2024-08-05 07:45,GEORGE OMONDI,254738982885,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,890
TX00909,2024-08-05 09:29,Daniel Kamau,0757110322,Kisumu,AG004,Kondele Traders,Kondele,deposit,2830
TX00910,2024-08-06 05:21,Tabitha Otieno,0768320549,Mombasa,AG008,Likoni Agency,Likoni,deposit,550
TX00911,2024-08-07 00:05,Esther Chebet,0732335804,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2840
TX00912,2024-08-07 06:26,Esther Ali,0717258033,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,770
TX00913,2024-08-07 08:32,OTIENO ODHIAMBO,0748664970,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,850
TX00914,2024-08-07 23:22,Kevin Ali,0736810718,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,3470
TX00915,2024-08-08 13:23,Brian Ali,+254758236176,Nairobi,AG001,Kibera Agency,Kibera,deposit,1210
TX00916,2024-08-08 19:33,WANJIRU KIPROP,+254730762633,Nairobi,AG003,CBD Mega Agency,CBD,deposit,610
TX00917,2024-08-09 00:01,Tabitha Omondi,0799935367,Kakamega,AG008,Likoni Agency,Likoni,send,690
TX00918,2024-08-09 01:03,Samuel Chebet,0781181137,Nairobi,AG003,CBD Mega Agency,CBD,deposit,5900
TX00919,2024-08-09 03:07,FAITH CHEBET,0770855361,Kakamega,AG010,Mumias Agency,Mumias,deposit,2070
TX00920,2024-08-09 08:50,Faith Achieng,0792159270,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,1050
TX00921,2024-08-09 16:56,Yusuf Ali,0732456072,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2930
TX00922,2024-08-10 01:16,Otieno Mutua,0793658336,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,3390
TX00923,2024-08-10 06:49,Esther Ali,+254778898676,Nairobi,AG001,Kibera Agency,Kibera,deposit,750
TX00924,2024-08-10 09:15,Zawadi Odhiambo,0715527223,Kakamega,AG010,Mumias Agency,Mumias,deposit,3840
TX00925,2024-08-10 12:03,Ruth Mwangi,+254735434684,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,4340
TX00926,2024-08-10 17:35,Amina Achieng,0740467830,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,3150
TX00927,2024-08-11 09:20,Brian Chebet,0735785667,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,2280
TX00928,2024-08-11 13:20,Zawadi Kariuki,0758808790,Nakuru,AG007,Molo Mobile Shop,Molo,send,160
TX00929,2024-08-11 16:50,Otieno Otieno,+254714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1270
TX00930,2024-08-11 18:12,Quincy Kiprop,0767945672,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,2160
TX00931,2024-08-11 19:12,Otieno Wanjiku,+254739912527,Kisumu,AG004,Kondele Traders,Kondele,send,2650
TX00932,2024-08-12 08:24,Ruth Ali,0768594225,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,2180
TX00933,2024-08-12 11:03,James Kiprop,0743585965,Nakuru,AG007,Molo Mobile Shop,Molo,send,920
TX00934,2024-08-12 11:42,Irene Achieng,+254728828887,Kisumu,AG005,Ahero Traders,Ahero,deposit,1910
TX00935,2024-08-12 12:08,Amina Kariuki,+254780857257,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,1710
TX00936,2024-08-12 16:27,Quincy Kiprop,0767945672,Mombasa,AG009,Changamwe Electronics,Changamwe,send,790
TX00937,2024-08-12 19:43,Tabitha Mutua,+254756826189,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1060
TX00938,2024-08-13 03:36,Esther Ali,254778898676,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,2370
TX00939,2024-08-13 07:19,Cynthia Wanjiku,0757336174,Kisumu,AG005,Ahero Traders,Ahero,deposit,2110
TX00940,2024-08-13 07:55,Zawadi Mutua,0734425622,Nairobi,AG001,Kibera Agency,Kibera,send,1780
TX00941,2024-08-13 11:04,Achieng Njoroge,0770692216,Kakamega,AG010,Mumias Agency,Mumias,deposit,5000
TX00942,2024-08-13 13:54,Peter Mutua,254758527453,Nakuru,AG006,Naivasha Electronics,Naivasha,send,550
TX00943,2024-08-13 18:20,Otieno Odhiambo,0748664970,Nairobi,AG001,Kibera Agency,Kibera,deposit,370
TX00944,2024-08-14 05:48,Brian Ali,0777540098,Mombasa,AG008,Likoni Agency,Likoni,deposit,200
TX00945,2024-08-14 06:03,Yusuf Njoroge,+254781698656,Mombasa,AG012,Othaya Mobile Shop,Othaya,withdrawal,2220
TX00946,2024-08-14 07:36,Ruth Ali,254768594225,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,4350
TX00947,2024-08-14 09:44,Otieno Ali,0796532173,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,3460
TX00948,2024-08-14 11:54,Samuel Njoroge,0758932135,Kisumu,AG005,Ahero Traders,Ahero,deposit,2630
TX00949,2024-08-14 12:43,LUCY MWANGI,0796705311,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,950
TX00950,2024-08-14 20:00,Cynthia Otieno,0798918869,Mombasa,AG011,Karatina Traders,Karatina,withdrawal,190
TX00951,2024-08-14 22:32,Emmanuel Kiprop,0766332024,Kisumu,AG005,Ahero Traders,Ahero,send,3700
TX00952,2024-08-15 01:09,Samuel Kamau,0797288130,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2170
TX00953,2024-08-15 01:11,Otieno Wanjiku,+254739912527,Kisumu,AG005,Ahero Traders,Ahero,deposit,2350
TX00954,2024-08-15 03:28,Samuel Omondi,0773701385,Kisumu,AG005,Ahero Traders,Ahero,send,1100
TX00955,2024-08-15 09:45,Brian Chebet,0735785667,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,110
TX00956,2024-08-15 10:14,Cynthia Njoroge,0742670375,Nairobi,AG001,Kibera Agency,Kibera,deposit,1850
TX00957,2024-08-15 11:39,Peter Mutua,254758527453,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,2170
TX00958,2024-08-15 13:00,James Chebet,254783445203,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,2200
TX00959,2024-08-15 15:40,Kevin Odhiambo,+254724934058,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,3600
TX00960,2024-08-15 16:33,Amina Achieng,0740467830,Nyeri,AG001,Kibera Agency,Kibera,send,570
TX00961,2024-08-15 17:03,FAITH WANJIKU,0781461966,Kakamega,AG010,Mumias Agency,Mumias,send,710
TX00962,2024-08-16 00:46,Mercy Nyambura,0747913516,Kisumu,AG004,Kondele Traders,Kondele,deposit,3420
TX00963,2024-08-16 03:03,Yusuf Njoroge,0781698656,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,2470
TX00964,2024-08-16 04:33,Kevin Ali,254736810718,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,390
TX00965,2024-08-16 04:39,OTIENO WANJIKU,+254768497889,Nyeri,AG011,Karatina Traders,Karatina,deposit,3030
TX00966,2024-08-16 04:54,Kevin Odhiambo,0789485143,Kakamega,AG010,Mumias Agency,Mumias,deposit,1180
TX00967,2024-08-16 05:04,Ruth Ali,0768594225,Nyeri,AG006,Naivasha Electronics,Naivasha,withdrawal,4960
TX00968,2024-08-16 21:53,Irene Otieno,254775963806,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,870
TX00969,2024-08-16 23:30,Samuel Otieno,0769424257,Kisumu,AG004,Kondele Traders,Kondele,send,170
TX00970,2024-08-17 11:40,Chebet Kamau,0774759708,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2710
TX00971,2024-08-17 11:44,Zawadi Ali,+254738550009,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1130
TX00972,2024-08-17 11:54,Umi Odhiambo,0789104220,Kisumu,AG006,Naivasha Electronics,Naivasha,send,480
TX00973,2024-08-17 14:02,Njeri Kiprop,+254752888749,Kakamega,AG010,Mumias Agency,Mumias,send,2230
TX00974,2024-08-17 22:21,Zawadi Odhiambo,0715527223,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1330
TX00975,2024-08-18 04:24,Ruth Kamau,0755338137,Mombasa,AG008,Likoni Agency,Likoni,deposit,1380
TX00976,2024-08-18 11:42,Amina Achieng,254740467830,Nyeri,AG011,Karatina Traders,Karatina,withdrawal,1030
TX00977,2024-08-18 16:29,Faith Chebet,+254770855361,Kakamega,AG010,Mumias Agency,Mumias,deposit,530
TX00978,2024-08-19 00:36,ACHIENG NJOROGE,0770692216,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,5560
TX00979,2024-08-19 12:32,Irene Otieno,0775963806,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,2150
TX00980,2024-08-19 14:36,Tabitha Ali,0714969608,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,2020
TX00981,2024-08-19 22:45,Tabitha Ali,0714969608,Nyeri,AG007,Molo Mobile Shop,Molo,withdrawal,2100
TX00982,2024-08-20 00:47,Esther Ali,0717258033,Kisumu,AG004,Kondele Traders,Kondele,send,540
TX00983,2024-08-20 04:48,Lucy Mutua,0753343892,Nairobi,AG001,Kibera Agency,Kibera,deposit,1400
TX00984,2024-08-20 11:08,Peter Otieno,254756906200,Nakuru,AG007,Molo Mobile Shop,Molo,send,1370
TX00985,2024-08-21 18:39,Zawadi Omondi,254732701953,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,860
TX00986,2024-08-22 11:37,Emmanuel Kiprop,0766332024,Kisumu,AG004,Kondele Traders,Kondele,deposit,1510
TX00987,2024-08-22 13:02,Chebet Nyambura,0745155401,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1160
TX00988,2024-08-22 17:32,James Mutua,+254745468032,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1860
TX00989,2024-08-22 18:49,Brian Ali,0777540098,Mombasa,AG005,Ahero Traders,Ahero,deposit,2400
TX00990,2024-08-23 04:10,Kevin Ali,0736810718,Nairobi,AG003,CBD Mega Agency,CBD,send,970
TX00991,2024-08-23 21:18,Yusuf Otieno,0747751577,Nyeri,AG011,Karatina Traders,Karatina,deposit,2800
TX00992,2024-08-24 10:35,Esther Mutua,+254763337519,Kisumu,AG005,Ahero Traders,Ahero,send,1940
TX00993,2024-08-24 17:57,Otieno Ali,+254796532173,Nakuru,AG001,Kibera Agency,Kibera,withdrawal,1740
TX00994,2024-08-24 19:38,Umi Odhiambo,0789104220,Kisumu,AG005,Ahero Traders,Ahero,send,830
TX00995,2024-08-24 20:18,Faith Chebet,0765596236,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1240
TX00996,2024-08-25 00:43,Daniel Kiprop,0798585568,Nairobi,AG005,Ahero Traders,Ahero,withdrawal,620
TX00997,2024-08-25 11:40,Njeri Otieno,+254782710955,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,4560
TX00998,2024-08-25 12:56,Brian Njoroge,0790876010,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,750
TX00999,2024-08-25 19:33,Esther Omondi,0721708124,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,4850
TX01000,2024-08-25 21:29,KEVIN ODHIAMBO,0793945277,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1380
TX01001,2024-08-26 06:57,Ruth Ali,0792588118,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,7310
TX01002,2024-08-26 07:33,Tabitha Kariuki,+254712826756,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,1630
TX01003,2024-08-26 07:43,Kevin Nyambura,0768987947,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1040
TX01004,2024-08-26 12:20,FAITH WANJIKU,0781461966,Kakamega,AG009,Changamwe Electronics,Changamwe,withdrawal,2490
TX01005,2024-08-26 13:44,Daniel Kamau,0757110322,Kisumu,AG005,Ahero Traders,Ahero,send,2030
TX01006,2024-08-26 15:30,Irene Achieng,254728828887,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,3920
TX01007,2024-08-27 07:34,George Wanjiku,0745870866,Nairobi,AG003,CBD Mega Agency,CBD,deposit,2570
TX01008,2024-08-27 23:50,BARAKA KARIUKI,+254752974991,Nairobi,AG001,Kibera Agency,Kibera,deposit,3130
TX01009,2024-08-28 00:47,Lucy Mutua,0753343892,Nairobi,AG001,Kibera Agency,Kibera,send,940
TX01010,2024-08-28 03:40,TABITHA NYAMBURA,0723654616,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,1870
TX01011,2024-08-28 08:48,Achieng Njoroge,+254770692216,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2490
TX01012,2024-08-28 10:34,Faith Odhiambo,0788298499,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,3790
TX01013,2024-08-28 11:16,Samuel Wanjiku,0776897241,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,4680
TX01014,2024-08-28 12:00,Yusuf Otieno,+254747751577,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,5330
TX01015,2024-08-28 23:07,Faith Achieng,+254792159270,Mombasa,AG010,Mumias Agency,Mumias,withdrawal,8850
TX01016,2024-08-28 23:58,Kevin Nyambura,0768987947,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,3510
TX01017,2024-08-29 00:16,Kevin Odhiambo,0724934058,Mombasa,AG007,Molo Mobile Shop,Molo,withdrawal,220
TX01018,2024-08-29 07:42,Esther Ali,0778898676,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,660
TX01019,2024-08-29 08:13,Zawadi Mutua,0780424966,Kisumu,AG009,Changamwe Electronics,Changamwe,send,1870
TX01020,2024-08-29 08:33,Samuel Kamau,0797288130,Kisumu,AG004,Kondele Traders,Kondele,send,2050
TX01021,2024-08-29 11:01,SAMUEL ALI,+254735580256,Kakamega,AG010,Mumias Agency,Mumias,deposit,540
TX01022,2024-08-29 11:53,Esther Ali,0778898676,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1440
TX01023,2024-08-29 16:08,Ruth Mutua,+254749753097,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,120
TX01024,2024-08-30 13:38,Otieno Wanjiku,0739912527,Kisumu,AG005,Ahero Traders,Ahero,deposit,24620
TX01025,2024-08-30 15:34,Esther Achieng,+254778860702,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,340
TX01026,2024-08-30 17:28,James Achieng,0724507260,Nakuru,AG003,CBD Mega Agency,CBD,deposit,310
TX01027,2024-08-30 21:25,Yusuf Omondi,+254738858153,Nairobi,AG001,Kibera Agency,Kibera,send,240
TX01028,2024-08-31 01:25,Achieng Kamau,0715656728,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,1720
TX01029,2024-08-31 12:37,Chebet Nyambura,0745155401,Kakamega,AG010,Mumias Agency,Mumias,send,740
TX01030,2024-08-31 23:21,Esther Chebet,+254732335804,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2520
TX01031,2024-09-01 00:50,Yusuf Omondi,0738858153,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,170
TX01032,2024-09-01 01:10,Baraka Kariuki,0752974991,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,140
TX01033,2024-09-01 14:45,James Chebet,+254783445203,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,3740
TX01034,2024-09-02 00:10,Tabitha Odhiambo,0722804395,Kisumu,AG010,Mumias Agency,Mumias,deposit,2440
TX01035,2024-09-02 12:21,Cynthia Wanjiku,+254757336174,Kisumu,AG005,Ahero Traders,Ahero,deposit,3230
TX01036,2024-09-02 18:03,ZAWADI MUTUA,0734425622,Nairobi,AG003,CBD Mega Agency,CBD,deposit,5660
TX01037,2024-09-03 01:54,Brian Ali,0777540098,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,880
TX01038,2024-09-03 02:34,Tabitha Otieno,0787970492,Kakamega,AG010,Mumias Agency,Mumias,send,430
TX01039,2024-09-03 08:59,George Wafula,+254745274138,Mombasa,AG008,Likoni Agency,Likoni,deposit,6710
TX01040,2024-09-03 09:04,George Wanjiku,0745870866,Nairobi,AG003,CBD Mega Agency,CBD,deposit,2830
TX01041,2024-09-03 19:41,James Omondi,0766457955,Nairobi,AG003,CBD Mega Agency,CBD,deposit,2080
TX01042,2024-09-04 01:46,Cynthia Njoroge,0742670375,Nairobi,AG003,CBD Mega Agency,CBD,deposit,930
TX01043,2024-09-04 02:51,WANJIRU ALI,0717521064,Mombasa,AG008,Likoni Agency,Likoni,deposit,3700
TX01044,2024-09-04 02:59,Kevin Odhiambo,0793945277,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,2230
TX01045,2024-09-04 05:29,Victor Mutua,0794959393,Mombasa,AG008,Likoni Agency,Likoni,deposit,1930
TX01046,2024-09-04 11:36,Ruth Ali,0792588118,Kisumu,AG005,Ahero Traders,Ahero,deposit,2250
TX01047,2024-09-04 12:35,George Wafula,0745274138,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,4290
TX01048,2024-09-04 12:41,Victor Mutua,0794959393,Mombasa,AG008,Likoni Agency,Likoni,send,1380
TX01049,2024-09-04 15:48,Cynthia Kamau,0746618936,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1970
TX01050,2024-09-04 18:08,James Mutua,0745468032,Kakamega,AG009,Changamwe Electronics,Changamwe,deposit,2140
TX01051,2024-09-04 20:08,Tabitha Wanjiku,0791654489,Nairobi,AG001,Kibera Agency,Kibera,deposit,5500
TX01052,2024-09-05 09:39,Tabitha Otieno,0787970492,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,4870
TX01053,2024-09-05 09:41,Wanjiru Nyambura,254710343706,Kisumu,AG004,Kondele Traders,Kondele,deposit,6110
TX01054,2024-09-05 14:01,George Kariuki,0779950911,Kisumu,AG005,Ahero Traders,Ahero,send,3900
TX01055,2024-09-05 15:10,Samuel Wanjiku,0757133398,Nairobi,AG001,Kibera Agency,Kibera,deposit,2130
TX01056,2024-09-05 17:05,Irene Njoroge,254783442361,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,3600
TX01057,2024-09-05 23:46,Emmanuel Mutua,0777249423,Mombasa,AG008,Likoni Agency,Likoni,deposit,1760
TX01058,2024-09-06 03:31,Ruth Kiprop,0781162841,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,780
TX01059,2024-09-06 03:45,Peter Mutua,+254728142270,Kisumu,AG004,Kondele Traders,Kondele,send,390
TX01060,2024-09-06 18:22,Faith Chebet,0765596236,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1500
TX01061,2024-09-06 23:56,Samuel Wanjiku,0757133398,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,2370
TX01062,2024-09-07 12:55,Kevin Kamau,+254786124492,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,4730
TX01063,2024-09-07 19:22,Peter Otieno,0756906200,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,2110
TX01064,2024-09-08 10:11,Tabitha Odhiambo,+254722804395,Kisumu,AG005,Ahero Traders,Ahero,send,400
TX01065,2024-09-08 18:21,Kevin Nyambura,0768987947,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,720
TX01066,2024-09-09 01:11,Tabitha Otieno,+254787970492,Kakamega,AG012,Othaya Mobile Shop,Othaya,withdrawal,3500
TX01067,2024-09-09 19:16,Cynthia Wanjiku,0757336174,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,3820
TX01068,2024-09-10 01:08,Kevin Odhiambo,0793945277,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,3490
TX01069,2024-09-10 02:23,Ruth Ali,0768594225,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,2290
TX01070,2024-09-10 03:16,Emmanuel Mutua,0777249423,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,780
TX01071,2024-09-10 03:46,Esther Chebet,+254732335804,Kisumu,AG005,Ahero Traders,Ahero,send,1100
TX01072,2024-09-10 10:28,Chebet Kamau,0774759708,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,5710
TX01073,2024-09-10 20:44,Brian Ali,0777540098,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1960
TX01074,2024-09-11 12:44,SAMUEL OMONDI,+254773701385,Kisumu,AG004,Kondele Traders,Kondele,send,390
TX01075,2024-09-12 01:26,Wanjiru Ali,0717521064,Mombasa,AG009,Changamwe Electronics,Changamwe,send,2650
TX01076,2024-09-12 05:11,Chebet Nyambura,0745155401,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2100
TX01077,2024-09-12 06:20,TABITHA WANJIKU,0791654489,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1420
TX01078,2024-09-12 10:12,James Chebet,254783445203,Nairobi,AG005,Ahero Traders,Ahero,send,300
TX01079,2024-09-12 10:50,George Omondi,0738982885,Kisumu,AG004,Kondele Traders,Kondele,deposit,840
TX01080,2024-09-12 15:34,Samuel Chebet,0781181137,Nairobi,AG012,Othaya Mobile Shop,Othaya,deposit,6250
TX01081,2024-09-12 17:43,James Chebet,+254783445203,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,490
TX01082,2024-09-12 18:37,Yusuf Achieng,+254718327276,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,2910
TX01083,2024-09-13 20:59,Victor Mutua,0794959393,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,870
TX01084,2024-09-14 00:13,Mercy Kiprop,0768729052,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,3460
TX01085,2024-09-14 02:30,Esther Mutua,+254763337519,Kisumu,AG004,Kondele Traders,Kondele,deposit,1820
TX01086,2024-09-14 19:52,Kevin Odhiambo,0798234176,Kakamega,AG010,Mumias Agency,Mumias,send,340
TX01087,2024-09-14 21:47,SAMUEL ALI,0735580256,Kakamega,AG010,Mumias Agency,Mumias,deposit,340
TX01088,2024-09-15 00:01,Samuel Chebet,0781181137,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,2800
TX01089,2024-09-15 03:29,Peter Kiprop,0723642023,Nyeri,AG002,Githurai Mobile Shop,Githurai,deposit,440
TX01090,2024-09-15 08:13,Otieno Wanjiku,0768497889,Nyeri,AG003,CBD Mega Agency,CBD,withdrawal,3380
TX01091,2024-09-15 09:09,Brian Ali,0758236176,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,3180
TX01092,2024-09-15 12:36,Yusuf Njoroge,254781698656,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,210
TX01093,2024-09-15 15:17,Amina Omondi,+254734657335,Nyeri,AG009,Changamwe Electronics,Changamwe,withdrawal,790
TX01094,2024-09-15 15:54,Esther Mutua,+254763337519,Kisumu,AG004,Kondele Traders,Kondele,deposit,340
TX01095,2024-09-15 19:30,Kevin Odhiambo,0789485143,Kakamega,AG010,Mumias Agency,Mumias,deposit,5380
TX01096,2024-09-15 21:48,Samuel Achieng,0732521987,Kakamega,AG010,Mumias Agency,Mumias,deposit,780
TX01097,2024-09-16 00:25,James Achieng,0724507260,Nakuru,AG007,Molo Mobile Shop,Molo,send,1010
TX01098,2024-09-17 08:54,Kevin Kariuki,0791950138,Mombasa,AG008,Likoni Agency,Likoni,deposit,1600
TX01099,2024-09-17 23:14,James Achieng,0724507260,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,2950
TX01100,2024-09-18 00:05,Cynthia Odhiambo,0763710064,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,1220
TX01101,2024-09-18 16:33,Zawadi Odhiambo,254715527223,Kakamega,AG010,Mumias Agency,Mumias,deposit,1950
TX01102,2024-09-18 20:43,Amina Achieng,0740467830,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,2220
TX01103,2024-09-19 00:13,Yusuf Omondi,0738858153,Nairobi,AG001,Kibera Agency,Kibera,send,1610
TX01104,2024-09-19 01:29,Kevin Kamau,0786124492,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,4470
TX01105,2024-09-19 01:39,Duncan Achieng,0757533891,Kisumu,AG005,Ahero Traders,Ahero,send,1490
TX01106,2024-09-19 19:49,CHEBET KAMAU,0774759708,Kisumu,AG005,Ahero Traders,Ahero,deposit,2000
TX01107,2024-09-19 22:36,Peter Wafula,0741815015,Nairobi,AG008,Likoni Agency,Likoni,withdrawal,3820
TX01108,2024-09-19 22:45,Otieno Mutua,0793658336,Mombasa,AG008,Likoni Agency,Likoni,send,1560
TX01109,2024-09-20 10:46,Otieno Wanjiku,0768497889,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,1920
TX01110,2024-09-20 11:17,Yusuf Njoroge,0781698656,Mombasa,AG008,Likoni Agency,Likoni,deposit,7740
TX01111,2024-09-20 11:25,Esther Ali,0717258033,Kisumu,AG004,Kondele Traders,Kondele,deposit,420
TX01112,2024-09-21 00:33,Cynthia Otieno,0798918869,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,920
TX01113,2024-09-21 06:51,Kevin Odhiambo,0724934058,Mombasa,AG008,Likoni Agency,Likoni,send,2540
TX01114,2024-09-21 14:56,Quincy Omondi,0796921408,Mombasa,AG008,Likoni Agency,Likoni,deposit,3060
TX01115,2024-09-22 07:14,Irene Achieng,0728828887,Kisumu,AG010,Mumias Agency,Mumias,deposit,1300
TX01116,2024-09-22 08:10,Lucy Mwangi,0796705311,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,2840
TX01117,2024-09-22 14:37,Emmanuel Wafula,0778528369,Kisumu,AG004,Kondele Traders,Kondele,deposit,1850
TX01118,2024-09-22 17:07,Kevin Kamau,0786124492,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1590
TX01119,2024-09-22 19:05,Otieno Kiprop,0794761775,Kisumu,AG004,Kondele Traders,Kondele,deposit,3930
TX01120,2024-09-22 23:09,Samuel Kamau,0797288130,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1110
TX01121,2024-09-23 11:32,Brian Chebet,+254724749319,Kisumu,AG004,Kondele Traders,Kondele,send,3270
TX01122,2024-09-23 17:14,Cynthia Wanjiku,+254757336174,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,450
TX01123,2024-09-23 18:28,Otieno Odhiambo,0748664970,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,330
TX01124,2024-09-23 20:05,Duncan Kariuki,0720226195,Kisumu,AG004,Kondele Traders,Kondele,deposit,2110
TX01125,2024-09-24 04:17,Zawadi Odhiambo,+254715527223,Kakamega,AG010,Mumias Agency,Mumias,send,620
TX01126,2024-09-24 16:11,Kevin Odhiambo,0798234176,Kakamega,AG010,Mumias Agency,Mumias,send,1280
TX01127,2024-09-25 03:14,Brian Njoroge,0790876010,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,520
TX01128,2024-09-25 07:30,Ruth Ali,0792588118,Kisumu,AG004,Kondele Traders,Kondele,send,1530
TX01129,2024-09-25 07:38,Ruth Wafula,+254717982346,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,4240
TX01130,2024-09-25 13:01,Zawadi Ali,0738550009,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,1900
TX01131,2024-09-26 02:52,Zawadi Odhiambo,0715527223,Kakamega,AG010,Mumias Agency,Mumias,deposit,420
TX01132,2024-09-26 15:35,George Kariuki,+254779950911,Kisumu,AG005,Ahero Traders,Ahero,send,2280
TX01133,2024-09-26 22:06,Tabitha Wanjiku,254791654489,Nairobi,AG001,Kibera Agency,Kibera,deposit,2470
TX01134,2024-09-27 06:56,Cynthia Wanjiku,0757336174,Kisumu,AG005,Ahero Traders,Ahero,send,1300
TX01135,2024-09-27 08:18,Quincy Omondi,0796921408,Mombasa,AG008,Likoni Agency,Likoni,deposit,1090
TX01136,2024-09-27 13:52,Tabitha Wanjiku,0791654489,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,3880
TX01137,2024-09-27 22:36,Samuel Ali,0735580256,Kakamega,AG010,Mumias Agency,Mumias,deposit,1400
TX01138,2024-09-27 23:53,Lucy Otieno,0782207908,Kakamega,AG010,Mumias Agency,Mumias,deposit,4270
TX01139,2024-09-28 04:23,Zawadi Mutua,0780424966,Kisumu,AG005,Ahero Traders,Ahero,send,2080
TX01140,2024-09-29 10:40,Ruth Mutua,0765990081,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,320
TX01141,2024-09-29 11:49,Otieno Njoroge,0792922794,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2900
TX01142,2024-09-29 15:23,Njeri Otieno,0782710955,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,2440
TX01143,2024-09-29 18:34,Amina Achieng,0740467830,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,1940
TX01144,2024-09-29 19:30,Kevin Odhiambo,0793945277,Mombasa,AG008,Likoni Agency,Likoni,deposit,870
TX01145,2024-09-29 21:56,Duncan Kariuki,0720226195,Kisumu,AG002,Githurai Mobile Shop,Githurai,deposit,1770
TX01146,2024-09-30 05:33,ZAWADI ODHIAMBO,0715527223,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,4490
TX01147,2024-09-30 07:10,Zawadi Ali,0738550009,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,1930
TX01148,2024-09-30 16:15,Esther Chebet,+254732335804,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,3250
TX01149,2024-09-30 18:04,Lucy Mutua,+254753343892,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,280
TX01150,2024-10-01 21:04,Chebet Kamau,0774759708,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1700
TX01151,2024-10-02 03:28,Cynthia Odhiambo,0763710064,Nyeri,AG011,Karatina Traders,Karatina,send,720
TX01152,2024-10-02 20:58,Zawadi Mutua,0780424966,Kisumu,AG004,Kondele Traders,Kondele,deposit,3360
TX01153,2024-10-02 21:38,Otieno Odhiambo,0748664970,Nairobi,AG001,Kibera Agency,Kibera,deposit,2690
TX01154,2024-10-02 22:47,Victor Nyambura,0792481430,Kakamega,AG004,Kondele Traders,Kondele,send,2030
TX01155,2024-10-03 16:49,Faith Wanjiku,0781461966,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,3060
TX01156,2024-10-03 18:35,Tabitha Otieno,+254768320549,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,2270
TX01157,2024-10-03 22:25,Yusuf Omondi,0738858153,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1570
TX01158,2024-10-04 01:00,Duncan Achieng,0757533891,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,610
TX01159,2024-10-04 15:41,Peter Otieno,0756906200,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1600
TX01160,2024-10-04 22:48,PETER KIPROP,0723642023,Nyeri,AG009,Changamwe Electronics,Changamwe,deposit,2410
TX01161,2024-10-05 00:39,Victor Mutua,0794959393,Mombasa,AG009,Changamwe Electronics,Changamwe,send,80
TX01162,2024-10-05 08:25,Otieno Otieno,0714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,3690
TX01163,2024-10-05 15:03,Duncan Omondi,0761565061,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2940
TX01164,2024-10-05 15:06,Quincy Mutua,0796494933,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1850
TX01165,2024-10-05 20:09,Irene Njoroge,254783442361,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,2290
TX01166,2024-10-05 20:19,Ruth Mwangi,0735434684,Nakuru,AG004,Kondele Traders,Kondele,withdrawal,2150
TX01167,2024-10-05 20:46,Irene Achieng,0728828887,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,740
TX01168,2024-10-06 00:57,James Kiprop,0743585965,Nakuru,AG007,Molo Mobile Shop,Molo,send,1800
TX01169,2024-10-06 05:18,Quincy Achieng,254740454092,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1330
TX01170,2024-10-06 07:28,Duncan Omondi,0761565061,Kisumu,AG005,Ahero Traders,Ahero,deposit,1660
TX01171,2024-10-06 07:35,Chebet Kiprop,0744309985,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,1240
TX01172,2024-10-06 08:44,Otieno Njoroge,0792922794,Kakamega,AG010,Mumias Agency,Mumias,deposit,1520
TX01173,2024-10-06 09:27,Cynthia Odhiambo,0763710064,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,1700
TX01174,2024-10-06 17:26,Faith Achieng,0792159270,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,2450
TX01175,2024-10-06 20:18,Peter Kiprop,0723642023,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,1640
TX01176,2024-10-06 20:38,Irene Otieno,254775963806,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,2960
TX01177,2024-10-06 22:16,Kevin Odhiambo,0798234176,Kakamega,AG010,Mumias Agency,Mumias,deposit,5720
TX01178,2024-10-06 22:18,Zawadi Odhiambo,0715527223,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1600
TX01179,2024-10-06 23:36,Kevin Odhiambo,0724934058,Mombasa,AG001,Kibera Agency,Kibera,deposit,1700
TX01180,2024-10-07 01:48,Brian Ali,0777540098,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,730
TX01181,2024-10-07 02:31,Peter Kiprop,+254723642023,Nyeri,AG011,Karatina Traders,Karatina,deposit,990
TX01182,2024-10-07 05:02,Faith Wanjiku,0781461966,Kakamega,AG011,Karatina Traders,Karatina,withdrawal,1500
TX01183,2024-10-07 06:21,Brian Chebet,0724749319,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1530
TX01184,2024-10-07 09:29,Otieno Njoroge,+254792922794,Kakamega,AG010,Mumias Agency,Mumias,send,730
TX01185,2024-10-07 10:01,Samuel Nyambura,0729502561,Kakamega,AG010,Mumias Agency,Mumias,deposit,520
TX01186,2024-10-07 11:57,Lucy Nyambura,+254783896326,Nakuru,AG012,Othaya Mobile Shop,Othaya,deposit,3240
TX01187,2024-10-07 22:31,Peter Wafula,0741815015,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,910
TX01188,2024-10-08 13:03,Amina Omondi,0730800514,Kisumu,AG005,Ahero Traders,Ahero,deposit,1810
TX01189,2024-10-08 15:33,Duncan Achieng,+254757533891,Kisumu,AG005,Ahero Traders,Ahero,deposit,1190
TX01190,2024-10-08 21:56,Amina Achieng,0740467830,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,2480
TX01191,2024-10-09 03:21,Otieno Odhiambo,+254785741278,Kakamega,AG010,Mumias Agency,Mumias,send,980
TX01192,2024-10-09 22:52,Duncan Achieng,0757533891,Kisumu,AG005,Ahero Traders,Ahero,deposit,2750
TX01193,2024-10-09 23:02,Amina Omondi,254730800514,Kisumu,AG005,Ahero Traders,Ahero,deposit,4060
TX01194,2024-10-10 05:54,Lucy Mutua,0753343892,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,2860
TX01195,2024-10-10 15:56,James Mutua,0745468032,Kakamega,AG010,Mumias Agency,Mumias,send,2240
TX01196,2024-10-11 11:59,Umi Odhiambo,0789104220,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,7100
TX01197,2024-10-12 00:42,Ruth Mwangi,0735434684,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,5050
TX01198,2024-10-12 01:28,Peter Mutua,+254758527453,Nakuru,AG006,Naivasha Electronics,Naivasha,send,1120
TX01199,2024-10-12 01:38,Amina Kariuki,+254780857257,Nakuru,AG003,CBD Mega Agency,CBD,deposit,3930
TX01200,2024-10-12 06:17,Tabitha Mutua,254756826189,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,760
TX01201,2024-10-12 09:49,Emmanuel Wafula,0778528369,Kisumu,AG004,Kondele Traders,Kondele,deposit,2940
TX01202,2024-10-12 16:34,Otieno Wanjiku,0768497889,Nyeri,AG011,Karatina Traders,Karatina,withdrawal,2780
TX01203,2024-10-12 23:50,Peter Mutua,0728142270,Kisumu,AG005,Ahero Traders,Ahero,deposit,890
TX01204,2024-10-13 23:24,Samuel Ali,0735580256,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2500
TX01205,2024-10-14 15:53,Achieng Njoroge,0770692216,Kakamega,AG010,Mumias Agency,Mumias,deposit,520
TX01206,2024-10-15 04:16,Tabitha Nyambura,+254723654616,Nairobi,AG003,CBD Mega Agency,CBD,send,2090
TX01207,2024-10-15 08:09,Faith Chebet,0770855361,Kakamega,AG010,Mumias Agency,Mumias,deposit,3650
TX01208,2024-10-15 11:03,Brian Ali,254758236176,Nairobi,AG009,Changamwe Electronics,Changamwe,deposit,950
TX01209,2024-10-15 14:12,Victor Nyambura,0782470004,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,1830
TX01210,2024-10-15 19:48,Amina Omondi,0734657335,Nyeri,AG011,Karatina Traders,Karatina,withdrawal,1140
TX01211,2024-10-15 23:03,EMMANUEL KIPROP,0766332024,Kisumu,AG005,Ahero Traders,Ahero,deposit,2110
TX01212,2024-10-16 00:27,Samuel Wanjiku,0757133398,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,1830
TX01213,2024-10-16 08:23,Yusuf Ali,+254732456072,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1380
TX01214,2024-10-16 12:19,Faith Achieng,254792159270,Mombasa,AG008,Likoni Agency,Likoni,deposit,1450
TX01215,2024-10-16 14:16,Samuel Kamau,0797288130,Kisumu,AG004,Kondele Traders,Kondele,deposit,1430
TX01216,2024-10-16 14:29,Ruth Mwangi,0735434684,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,2160
TX01217,2024-10-16 23:47,Njeri Kiprop,0752888749,Kakamega,AG010,Mumias Agency,Mumias,deposit,5100
TX01218,2024-10-17 02:19,Tabitha Wanjiku,0791654489,Nairobi,AG005,Ahero Traders,Ahero,withdrawal,3700
TX01219,2024-10-17 10:40,Ruth Mwangi,0735434684,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,620
TX01220,2024-10-17 11:50,Njeri Otieno,0782710955,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,310
TX01221,2024-10-17 15:58,Zawadi Mutua,0734425622,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,3540
TX01222,2024-10-17 19:52,SAMUEL ACHIENG,254732521987,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2470
TX01223,2024-10-17 23:51,Samuel Ali,0735580256,Kakamega,AG010,Mumias Agency,Mumias,deposit,2600
TX01224,2024-10-18 03:52,Brian Njoroge,0790876010,Nakuru,AG006,Naivasha Electronics,Naivasha,send,430
TX01225,2024-10-18 05:47,Faith Achieng,0792159270,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,470
TX01226,2024-10-18 10:00,Yusuf Otieno,0747751577,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,1090
TX01227,2024-10-18 11:33,Duncan Omondi,0761565061,Kisumu,AG004,Kondele Traders,Kondele,deposit,2940
TX01228,2024-10-18 19:44,Njeri Kiprop,254752888749,Kakamega,AG010,Mumias Agency,Mumias,deposit,510
TX01229,2024-10-19 03:24,Samuel Wanjiku,+254776897241,Kisumu,AG004,Kondele Traders,Kondele,send,990
TX01230,2024-10-19 07:35,Wanjiru Mwangi,0739166890,Kisumu,AG004,Kondele Traders,Kondele,deposit,4340
TX01231,2024-10-19 08:03,Baraka Kariuki,0752974991,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,700
TX01232,2024-10-19 09:24,WANJIRU KIPROP,+254730762633,Nairobi,AG009,Changamwe Electronics,Changamwe,deposit,1500
TX01233,2024-10-19 22:15,George Kariuki,254779950911,Kisumu,AG002,Githurai Mobile Shop,Githurai,withdrawal,1310
TX01234,2024-10-20 03:56,Victor Nyambura,0792481430,Kakamega,AG010,Mumias Agency,Mumias,deposit,1650
TX01235,2024-10-20 14:36,Kevin Odhiambo,0789485143,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,5560
TX01236,2024-10-20 20:33,Otieno Odhiambo,254785741278,Kakamega,AG010,Mumias Agency,Mumias,deposit,1390
TX01237,2024-10-20 23:18,Kevin Odhiambo,+254793945277,Mombasa,AG008,Likoni Agency,Likoni,deposit,3330
TX01238,2024-10-21 06:09,Otieno Otieno,0714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1640
TX01239,2024-10-21 19:47,Ruth Kiprop,0717570364,Nairobi,AG005,Ahero Traders,Ahero,withdrawal,2130
TX01240,2024-10-22 04:27,Kevin Kamau,0786124492,Nakuru,AG007,Molo Mobile Shop,Molo,send,730
TX01241,2024-10-22 09:12,Faith Odhiambo,0788298499,Nakuru,AG009,Changamwe Electronics,Changamwe,send,1890
TX01242,2024-10-22 14:03,Ruth Ali,0768594225,Nyeri,AG005,Ahero Traders,Ahero,deposit,40
TX01243,2024-10-22 19:03,Mercy Kiprop,0768729052,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,290
TX01244,2024-10-22 20:06,Esther Omondi,+254721708124,Nyeri,AG003,CBD Mega Agency,CBD,send,520
TX01245,2024-10-23 00:04,Tabitha Otieno,0787970492,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,3820
TX01246,2024-10-23 02:18,Baraka Kariuki,+254752974991,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,540
TX01247,2024-10-23 11:06,GEORGE WANJIKU,0745870866,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,3090
TX01248,2024-10-24 16:55,Tabitha Omondi,+254799935367,Kakamega,AG009,Changamwe Electronics,Changamwe,withdrawal,2970
TX01249,2024-10-25 00:18,Brian Chebet,+254724749319,Kisumu,AG005,Ahero Traders,Ahero,deposit,2550
TX01250,2024-10-25 00:58,Kevin Kamau,0786124492,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,870
TX01251,2024-10-25 06:31,Esther Mutua,+254763337519,Kisumu,AG004,Kondele Traders,Kondele,deposit,3480
TX01252,2024-10-25 11:44,Wanjiru Kariuki,0713702236,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,1580
TX01253,2024-10-25 16:41,Samuel Nyambura,0729502561,Kakamega,AG007,Molo Mobile Shop,Molo,withdrawal,1420
TX01254,2024-10-26 00:10,Tabitha Otieno,0787970492,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1260
TX01255,2024-10-26 06:46,Cynthia Otieno,0798918869,Mombasa,AG008,Likoni Agency,Likoni,deposit,3550
TX01256,2024-10-26 11:07,Victor Nyambura,0782470004,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,2060
TX01257,2024-10-26 13:51,Peter Otieno,0756906200,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1040
TX01258,2024-10-26 14:01,Samuel Kamau,0797288130,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1370
TX01259,2024-10-26 18:33,Cynthia Kamau,254746618936,Nairobi,AG003,CBD Mega Agency,CBD,deposit,640
TX01260,2024-10-27 12:26,Faith Chebet,0770855361,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2840
TX01261,2024-10-27 18:21,Lucy Mwangi,+254738773451,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,3860
TX01262,2024-10-27 22:26,ZAWADI MUTUA,0780424966,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1060
TX01263,2024-10-27 22:49,MERCY NYAMBURA,0747913516,Kisumu,AG005,Ahero Traders,Ahero,deposit,1880
TX01264,2024-10-28 23:37,Otieno Ali,0796532173,Nakuru,AG006,Naivasha Electronics,Naivasha,send,2220
TX01265,2024-10-29 12:07,Ruth Kiprop,+254781162841,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,2520
TX01266,2024-10-29 14:03,Victor Nyambura,0782470004,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,760
TX01267,2024-10-29 17:00,YUSUF ACHIENG,0718327276,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,1430
TX01268,2024-10-30 00:40,Ruth Mwangi,0735434684,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,950
TX01269,2024-10-30 07:09,Faith Chebet,0770855361,Kakamega,AG010,Mumias Agency,Mumias,send,400
TX01270,2024-10-30 12:59,Wanjiru Mwangi,0739166890,Kisumu,AG005,Ahero Traders,Ahero,deposit,5110
TX01271,2024-10-30 19:01,Esther Chebet,0732335804,Kisumu,AG005,Ahero Traders,Ahero,deposit,2920
TX01272,2024-10-30 23:52,Otieno Ali,254796532173,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,700
TX01273,2024-10-31 00:21,Otieno Wanjiku,0768497889,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,480
TX01274,2024-10-31 01:37,Lucy Mutua,0753343892,Nairobi,AG003,CBD Mega Agency,CBD,deposit,4000
TX01275,2024-10-31 03:32,FAITH ACHIENG,+254792159270,Mombasa,AG008,Likoni Agency,Likoni,send,740
TX01276,2024-10-31 06:17,George Kariuki,0779950911,Kisumu,AG004,Kondele Traders,Kondele,send,740
TX01277,2024-10-31 09:29,Wanjiru Kariuki,0713702236,Nyeri,AG007,Molo Mobile Shop,Molo,send,1840
TX01278,2024-10-31 11:52,Brian Chebet,0724749319,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2440
TX01279,2024-10-31 18:27,Peter Wafula,0741815015,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,4450
TX01280,2024-10-31 20:26,Duncan Kariuki,0720226195,Kisumu,AG004,Kondele Traders,Kondele,deposit,2830
TX01281,2024-11-01 05:13,Otieno Odhiambo,0785741278,Kakamega,AG010,Mumias Agency,Mumias,deposit,1290
TX01282,2024-11-01 10:10,Lucy Mwangi,0738773451,Kakamega,AG010,Mumias Agency,Mumias,send,460
TX01283,2024-11-01 11:32,Amina Omondi,254730800514,Kisumu,AG002,Githurai Mobile Shop,Githurai,send,440
TX01284,2024-11-01 15:11,Otieno Wanjiku,0739912527,Kisumu,AG005,Ahero Traders,Ahero,send,2260
TX01285,2024-11-01 16:32,Cynthia Kamau,0746618936,Nairobi,AG012,Othaya Mobile Shop,Othaya,withdrawal,3230
TX01286,2024-11-01 21:03,Baraka Kariuki,0752974991,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,1560
TX01287,2024-11-02 11:20,Irene Achieng,0728828887,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,5710
TX01288,2024-11-02 17:16,Yusuf Odhiambo,+254713732630,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,2140
TX01289,2024-11-02 20:25,Otieno Otieno,0714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,2580
TX01290,2024-11-02 20:41,Zawadi Mutua,254780424966,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2610
TX01291,2024-11-03 04:46,JAMES ACHIENG,0724507260,Nakuru,AG007,Molo Mobile Shop,Molo,send,1510
TX01292,2024-11-04 00:18,Kevin Odhiambo,0798234176,Kakamega,AG010,Mumias Agency,Mumias,deposit,210
TX01293,2024-11-04 01:33,Ruth Mutua,0765990081,Nyeri,AG009,Changamwe Electronics,Changamwe,withdrawal,3470
TX01294,2024-11-04 03:55,Yusuf Odhiambo,0713732630,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1500
TX01295,2024-11-04 09:42,James Achieng,0724507260,Nakuru,AG006,Naivasha Electronics,Naivasha,send,2660
TX01296,2024-11-04 10:46,Cynthia Odhiambo,0763710064,Nyeri,AG011,Karatina Traders,Karatina,send,1110
TX01297,2024-11-04 14:31,Samuel Wanjiku,0776897241,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2260
TX01298,2024-11-04 18:36,James Kiprop,+254743585965,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1480
TX01299,2024-11-04 20:08,Irene Kariuki,0787902687,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,2180
TX01300,2024-11-05 00:03,Zawadi Mutua,254780424966,Kisumu,AG004,Kondele Traders,Kondele,deposit,3720
TX01301,2024-11-05 02:39,Tabitha Nyambura,+254723654616,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,3430
TX01302,2024-11-05 07:04,Otieno Otieno,+254714603379,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,1080
TX01303,2024-11-05 12:26,Otieno Njoroge,0792922794,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2520
TX01304,2024-11-05 19:21,Achieng Njoroge,+254770692216,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1080
TX01305,2024-11-06 00:14,Duncan Kariuki,0720226195,Kisumu,AG005,Ahero Traders,Ahero,deposit,330
TX01306,2024-11-07 02:07,Brian Njoroge,0790876010,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,2030
TX01307,2024-11-07 04:13,AMINA KARIUKI,0780857257,Nakuru,AG011,Karatina Traders,Karatina,deposit,2190
TX01308,2024-11-07 12:43,Lucy Mutua,254753343892,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,980
TX01309,2024-11-07 19:37,Brian Ali,0758236176,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,2040
TX01310,2024-11-08 01:12,Lucy Mwangi,0738773451,Kakamega,AG010,Mumias Agency,Mumias,deposit,610
TX01311,2024-11-08 01:32,James Omondi,254766457955,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,1940
TX01312,2024-11-08 04:05,Duncan Achieng,0757533891,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2130
TX01313,2024-11-08 14:07,Duncan Omondi,0761565061,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,4900
TX01314,2024-11-08 17:09,Ruth Ali,+254792588118,Kisumu,AG008,Likoni Agency,Likoni,deposit,3050
TX01315,2024-11-08 19:29,Ruth Kiprop,0781162841,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,2520
TX01316,2024-11-08 21:24,Tabitha Kariuki,0712826756,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,2200
TX01317,2024-11-08 22:14,Zawadi Mutua,+254734425622,Nairobi,AG005,Ahero Traders,Ahero,send,1110
TX01318,2024-11-09 05:28,Otieno Wanjiku,0768497889,Nyeri,AG011,Karatina Traders,Karatina,deposit,990
TX01319,2024-11-09 13:28,Tabitha Mutua,+254756826189,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,4350
TX01320,2024-11-10 05:37,James Mutua,+254745468032,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2480
TX01321,2024-11-11 01:11,Zawadi Odhiambo,0715527223,Kakamega,AG010,Mumias Agency,Mumias,send,1210
TX01322,2024-11-11 11:45,Yusuf Ali,0732456072,Kisumu,AG005,Ahero Traders,Ahero,deposit,2190
TX01323,2024-11-11 13:27,Duncan Achieng,0757533891,Kisumu,AG005,Ahero Traders,Ahero,deposit,750
TX01324,2024-11-11 22:29,James Chebet,0783445203,Nairobi,AG001,Kibera Agency,Kibera,deposit,2670
TX01325,2024-11-12 19:25,Njeri Otieno,0782710955,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,3390
TX01326,2024-11-12 23:57,Chebet Kamau,0774759708,Kisumu,AG005,Ahero Traders,Ahero,deposit,1070
TX01327,2024-11-13 01:24,Irene Njoroge,+254783442361,Nairobi,AG003,CBD Mega Agency,CBD,deposit,2570
TX01328,2024-11-13 18:32,Victor Nyambura,+254782470004,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,3730
TX01329,2024-11-13 23:32,Chebet Kiprop,0744309985,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,810
TX01330,2024-11-14 06:05,Otieno Wanjiku,254739912527,Kisumu,AG004,Kondele Traders,Kondele,send,1080
TX01331,2024-11-14 10:19,Cynthia Kamau,+254746618936,Nairobi,AG001,Kibera Agency,Kibera,send,920
TX01332,2024-11-14 11:40,Faith Achieng,0792159270,Mombasa,AG008,Likoni Agency,Likoni,send,220
TX01333,2024-11-14 12:04,Otieno Wanjiku,+254739912527,Kisumu,AG005,Ahero Traders,Ahero,deposit,430
TX01334,2024-11-14 12:46,Otieno Otieno,+254714603379,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,940
TX01335,2024-11-14 21:59,Victor Nyambura,0792481430,Kakamega,AG010,Mumias Agency,Mumias,deposit,1130
TX01336,2024-11-16 07:02,Victor Nyambura,0792481430,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1230
TX01337,2024-11-16 08:19,Duncan Kariuki,0720226195,Kisumu,AG005,Ahero Traders,Ahero,deposit,5950
TX01338,2024-11-16 22:49,Emmanuel Omondi,+254725380344,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,3490
TX01339,2024-11-17 00:23,TABITHA KARIUKI,0712826756,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,3480
TX01340,2024-11-17 02:14,Zawadi Odhiambo,0715527223,Kakamega,AG010,Mumias Agency,Mumias,send,1220
TX01341,2024-11-17 09:47,Irene Kariuki,0787902687,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,3260
TX01342,2024-11-17 16:57,Otieno Ali,0796532173,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,1330
TX01343,2024-11-17 21:07,Samuel Omondi,0773701385,Kisumu,AG005,Ahero Traders,Ahero,send,290
TX01344,2024-11-17 21:21,Achieng Njoroge,0770692216,Kakamega,AG010,Mumias Agency,Mumias,deposit,4520
TX01345,2024-11-18 02:38,LUCY MWANGI,254796705311,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,1210
TX01346,2024-11-18 03:53,Daniel Kiprop,0798585568,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,510
TX01347,2024-11-18 15:20,Duncan Achieng,+254757533891,Kisumu,AG005,Ahero Traders,Ahero,deposit,570
TX01348,2024-11-18 16:37,Samuel Achieng,0732521987,Kakamega,AG010,Mumias Agency,Mumias,deposit,5460
TX01349,2024-11-18 20:12,Amina Omondi,0734657335,Nyeri,AG012,Othaya Mobile Shop,Othaya,withdrawal,600
TX01350,2024-11-18 21:22,KEVIN ODHIAMBO,0724934058,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,3500
TX01351,2024-11-18 21:28,Wanjiru Kiprop,0730762633,Nairobi,AG001,Kibera Agency,Kibera,deposit,2890
TX01352,2024-11-18 23:25,Ruth Kiprop,0717570364,Nairobi,AG001,Kibera Agency,Kibera,send,2240
TX01353,2024-11-18 23:35,Njeri Kiprop,0752888749,Kakamega,AG010,Mumias Agency,Mumias,deposit,5340
TX01354,2024-11-19 06:46,BRIAN CHEBET,0724749319,Kisumu,AG005,Ahero Traders,Ahero,deposit,6680
TX01355,2024-11-19 09:45,Otieno Mutua,0793658336,Mombasa,AG007,Molo Mobile Shop,Molo,deposit,460
TX01356,2024-11-19 13:56,Tabitha Nyambura,0723654616,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,2170
TX01357,2024-11-19 19:43,Ruth Mutua,0749753097,Mombasa,AG009,Changamwe Electronics,Changamwe,withdrawal,1040
TX01358,2024-11-20 07:17,DUNCAN ACHIENG,+254757533891,Kisumu,AG005,Ahero Traders,Ahero,deposit,1070
TX01359,2024-11-21 14:43,Njeri Odhiambo,0761137549,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,2570
TX01360,2024-11-22 18:46,Peter Mutua,0728142270,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,6050
TX01361,2024-11-22 22:12,Achieng Kamau,254715656728,Nyeri,AG011,Karatina Traders,Karatina,deposit,2000
TX01362,2024-11-23 01:10,Samuel Nyambura,+254729502561,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,5140
TX01363,2024-11-23 13:11,Samuel Ali,0735580256,Kakamega,AG012,Othaya Mobile Shop,Othaya,withdrawal,2180
TX01364,2024-11-23 14:38,Faith Achieng,0792159270,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1820
TX01365,2024-11-23 15:52,Baraka Kariuki,254752974991,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,5400
TX01366,2024-11-23 23:19,Otieno Odhiambo,0785741278,Kakamega,AG010,Mumias Agency,Mumias,deposit,780
TX01367,2024-11-24 08:02,FAITH ODHIAMBO,0788298499,Nakuru,AG007,Molo Mobile Shop,Molo,deposit,1950
TX01368,2024-11-24 11:08,Kevin Odhiambo,0724934058,Mombasa,AG012,Othaya Mobile Shop,Othaya,withdrawal,1170
TX01369,2024-11-24 22:50,Tabitha Mutua,+254756826189,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,3610
TX01370,2024-11-25 05:37,Brian Ali,0777540098,Mombasa,AG008,Likoni Agency,Likoni,deposit,360
TX01371,2024-11-25 09:48,OTIENO NJOROGE,0792922794,Kakamega,AG010,Mumias Agency,Mumias,deposit,810
TX01372,2024-11-25 15:38,SAMUEL OMONDI,0773701385,Kisumu,AG005,Ahero Traders,Ahero,send,80
TX01373,2024-11-25 18:30,Wanjiru Kiprop,+254730762633,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,3060
TX01374,2024-11-25 21:23,Daniel Kiprop,254798585568,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,870
TX01375,2024-11-26 03:05,Quincy Kiprop,0767945672,Mombasa,AG009,Changamwe Electronics,Changamwe,send,1920
TX01376,2024-11-26 17:35,Yusuf Ali,0732456072,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,1270
TX01377,2024-11-26 23:18,Quincy Omondi,0796921408,Mombasa,AG008,Likoni Agency,Likoni,deposit,2840
TX01378,2024-11-27 03:01,Quincy Omondi,+254796921408,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,3830
TX01379,2024-11-27 14:57,Wanjiru Ali,0717521064,Mombasa,AG008,Likoni Agency,Likoni,send,2840
TX01380,2024-11-27 18:19,James Chebet,+254783445203,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1540
TX01381,2024-11-27 19:32,Kevin Odhiambo,254724934058,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,4270
TX01382,2024-11-28 02:21,Tabitha Ali,0714969608,Nyeri,AG011,Karatina Traders,Karatina,send,580
TX01383,2024-11-28 04:08,Ruth Mwangi,0735434684,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,900
TX01384,2024-11-28 06:58,Irene Achieng,0728828887,Kisumu,AG004,Kondele Traders,Kondele,deposit,440
TX01385,2024-11-28 15:45,DANIEL KAMAU,254757110322,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,3030
TX01386,2024-11-29 16:17,Wanjiru Kiprop,0730762633,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,530
TX01387,2024-11-29 17:23,Duncan Kariuki,0720226195,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2550
TX01388,2024-11-29 18:25,Brian Njoroge,0790876010,Nakuru,AG001,Kibera Agency,Kibera,deposit,2700
TX01389,2024-11-30 03:17,Zawadi Kariuki,0758808790,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1020
TX01390,2024-11-30 06:36,Esther Ali,+254717258033,Kisumu,AG005,Ahero Traders,Ahero,send,230
TX01391,2024-11-30 14:12,Duncan Omondi,+254761565061,Kisumu,AG004,Kondele Traders,Kondele,deposit,1620
TX01392,2024-11-30 18:27,GEORGE WAFULA,0745274138,Mombasa,AG011,Karatina Traders,Karatina,deposit,1360
TX01393,2024-11-30 21:07,Kevin Odhiambo,0789485143,Kakamega,AG010,Mumias Agency,Mumias,deposit,1860
TX01394,2024-11-30 22:53,Achieng Njoroge,0770692216,Kakamega,AG010,Mumias Agency,Mumias,send,1230
TX01395,2024-12-01 02:50,Lucy Mwangi,254738773451,Kakamega,AG010,Mumias Agency,Mumias,send,1310
TX01396,2024-12-01 10:17,Duncan Kariuki,0720226195,Kisumu,AG005,Ahero Traders,Ahero,send,1520
TX01397,2024-12-01 13:10,Cynthia Njoroge,0742670375,Nairobi,AG001,Kibera Agency,Kibera,deposit,1810
TX01398,2024-12-01 13:33,Lucy Otieno,+254782207908,Kakamega,AG010,Mumias Agency,Mumias,send,2270
TX01399,2024-12-01 13:52,Faith Achieng,0792159270,Mombasa,AG008,Likoni Agency,Likoni,deposit,2800
TX01400,2024-12-01 16:49,Samuel Nyambura,0729502561,Kakamega,AG010,Mumias Agency,Mumias,deposit,2060
TX01401,2024-12-01 22:52,Cynthia Kamau,0746618936,Nairobi,AG006,Naivasha Electronics,Naivasha,withdrawal,5370
TX01402,2024-12-02 06:52,Peter Mutua,0728142270,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,3350
TX01403,2024-12-02 08:56,Otieno Odhiambo,0785741278,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,250
TX01404,2024-12-02 11:22,Samuel Wanjiku,0757133398,Nairobi,AG003,CBD Mega Agency,CBD,deposit,940
TX01405,2024-12-02 20:44,BRIAN NJOROGE,0790876010,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,510
TX01406,2024-12-03 01:42,Kevin Ali,0736810718,Nairobi,AG001,Kibera Agency,Kibera,deposit,3830
TX01407,2024-12-03 17:35,Brian Ali,0758236176,Nairobi,AG001,Kibera Agency,Kibera,deposit,2080
TX01408,2024-12-04 06:57,Brian Njoroge,0790876010,Nakuru,AG006,Naivasha Electronics,Naivasha,send,1230
TX01409,2024-12-04 14:57,Otieno Wanjiku,+254739912527,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,1510
TX01410,2024-12-04 16:26,Brian Chebet,0724749319,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,760
TX01411,2024-12-04 20:32,Lucy Mutua,254753343892,Nairobi,AG012,Othaya Mobile Shop,Othaya,deposit,5180
TX01412,2024-12-05 00:57,TABITHA OTIENO,0768320549,Mombasa,AG004,Kondele Traders,Kondele,withdrawal,1690
TX01413,2024-12-05 01:31,Victor Nyambura,0782470004,Nakuru,AG007,Molo Mobile Shop,Molo,send,540
TX01414,2024-12-05 02:33,Esther Ali,0778898676,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,1190
TX01415,2024-12-05 05:03,Samuel Otieno,0769424257,Kisumu,AG004,Kondele Traders,Kondele,deposit,1350
TX01416,2024-12-05 16:13,Daniel Kiprop,0798585568,Nairobi,AG008,Likoni Agency,Likoni,send,2970
TX01417,2024-12-06 16:58,Lucy Nyambura,0783896326,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,1780
TX01418,2024-12-06 21:16,FAITH WANJIKU,0781461966,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2280
TX01419,2024-12-07 06:10,Otieno Odhiambo,+254748664970,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,2740
TX01420,2024-12-07 14:11,James Mutua,254745468032,Kakamega,AG010,Mumias Agency,Mumias,deposit,3170
TX01421,2024-12-07 22:01,James Mutua,0745468032,Kakamega,AG010,Mumias Agency,Mumias,deposit,2350
TX01422,2024-12-08 00:10,Victor Nyambura,0792481430,Kakamega,AG010,Mumias Agency,Mumias,send,1650
TX01423,2024-12-08 03:31,Njeri Odhiambo,0761137549,Nakuru,AG003,CBD Mega Agency,CBD,deposit,2450
TX01424,2024-12-08 05:05,Otieno Ali,0796532173,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1830
TX01425,2024-12-08 06:14,Wanjiru Kiprop,+254730762633,Nairobi,AG003,CBD Mega Agency,CBD,deposit,880
TX01426,2024-12-08 07:25,Wanjiru Kiprop,0730762633,Nairobi,AG001,Kibera Agency,Kibera,send,830
TX01427,2024-12-08 08:18,Esther Ali,0778898676,Nairobi,AG003,CBD Mega Agency,CBD,send,420
TX01428,2024-12-08 15:58,Victor Nyambura,0792481430,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,5270
TX01429,2024-12-08 16:46,Esther Mutua,0763337519,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,890
TX01430,2024-12-09 03:19,Chebet Kamau,0774759708,Kisumu,AG004,Kondele Traders,Kondele,deposit,7840
TX01431,2024-12-09 17:20,Umi Odhiambo,0789104220,Kisumu,AG005,Ahero Traders,Ahero,deposit,2920
TX01432,2024-12-09 18:52,Ruth Wafula,0717982346,Nyeri,AG011,Karatina Traders,Karatina,deposit,2280
TX01433,2024-12-10 12:33,Ruth Kamau,0755338137,Mombasa,AG010,Mumias Agency,Mumias,withdrawal,3650
TX01434,2024-12-11 01:20,Peter Otieno,0756906200,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,2520
TX01435,2024-12-11 05:49,Otieno Ali,0796532173,Nakuru,AG010,Mumias Agency,Mumias,withdrawal,1200
TX01436,2024-12-11 06:41,Cynthia Njoroge,+254742670375,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,240
TX01437,2024-12-11 07:54,Achieng Njoroge,0770692216,Kakamega,AG010,Mumias Agency,Mumias,deposit,1450
TX01438,2024-12-11 14:51,Zawadi Ali,0738550009,Nairobi,AG007,Molo Mobile Shop,Molo,withdrawal,1180
TX01439,2024-12-11 19:25,George Omondi,0738982885,Kisumu,AG004,Kondele Traders,Kondele,deposit,1570
TX01440,2024-12-11 21:19,Ruth Mutua,0749753097,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,3590
TX01441,2024-12-11 23:09,Wanjiru Nyambura,0710343706,Kisumu,AG005,Ahero Traders,Ahero,deposit,1350
TX01442,2024-12-11 23:17,James Achieng,0724507260,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,4280
TX01443,2024-12-12 05:04,Faith Achieng,0792159270,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,1070
TX01444,2024-12-12 11:31,Yusuf Omondi,0738858153,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,2320
TX01445,2024-12-12 22:22,Esther Chebet,254732335804,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,6370
TX01446,2024-12-13 08:08,CYNTHIA NJOROGE,0742670375,Nairobi,AG002,Githurai Mobile Shop,Githurai,withdrawal,3050
TX01447,2024-12-13 14:19,Irene Njoroge,0783442361,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,650
TX01448,2024-12-13 15:31,Otieno Otieno,+254714603379,Mombasa,AG008,Likoni Agency,Likoni,send,400
TX01449,2024-12-13 21:02,George Wafula,+254745274138,Mombasa,AG008,Likoni Agency,Likoni,send,240
TX01450,2024-12-14 02:13,Samuel Wanjiku,0757133398,Nairobi,AG002,Githurai Mobile Shop,Githurai,send,2080
TX01451,2024-12-14 07:28,JAMES CHEBET,0783445203,Nairobi,AG003,CBD Mega Agency,CBD,deposit,700
TX01452,2024-12-14 16:14,Cynthia Otieno,0798918869,Mombasa,AG011,Karatina Traders,Karatina,withdrawal,660
TX01453,2024-12-15 05:30,Otieno Odhiambo,+254785741278,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1070
TX01454,2024-12-15 22:29,Irene Achieng,+254728828887,Kisumu,AG004,Kondele Traders,Kondele,send,490
TX01455,2024-12-16 23:25,Lucy Otieno,0782207908,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2380
TX01456,2024-12-17 04:41,Quincy Mutua,0796494933,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,1640
TX01457,2024-12-17 09:27,Quincy Mutua,+254796494933,Nairobi,AG010,Mumias Agency,Mumias,withdrawal,4660
TX01458,2024-12-18 00:09,James Omondi,0766457955,Nairobi,AG003,CBD Mega Agency,CBD,withdrawal,1440
TX01459,2024-12-18 08:31,Njeri Kiprop,0752888749,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,1300
TX01460,2024-12-18 15:09,Peter Wafula,0741815015,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,1500
TX01461,2024-12-19 09:05,Faith Chebet,+254770855361,Kakamega,AG010,Mumias Agency,Mumias,deposit,3000
TX01462,2024-12-19 14:54,Wanjiru Mwangi,0739166890,Kisumu,AG002,Githurai Mobile Shop,Githurai,deposit,640
TX01463,2024-12-20 03:41,MERCY NYAMBURA,0747913516,Kisumu,AG004,Kondele Traders,Kondele,withdrawal,2300
TX01464,2024-12-20 04:50,Kevin Odhiambo,0793945277,Mombasa,AG008,Likoni Agency,Likoni,send,870
TX01465,2024-12-21 00:49,Samuel Achieng,0732521987,Kakamega,AG010,Mumias Agency,Mumias,deposit,1570
TX01466,2024-12-21 10:14,Samuel Nyambura,0729502561,Kakamega,AG010,Mumias Agency,Mumias,deposit,2100
TX01467,2024-12-21 12:47,Kevin Ali,0736810718,Nairobi,AG001,Kibera Agency,Kibera,withdrawal,3320
TX01468,2024-12-21 18:26,Duncan Kariuki,0720226195,Kisumu,AG005,Ahero Traders,Ahero,send,2410
TX01469,2024-12-22 12:26,Yusuf Ali,+254732456072,Kisumu,AG005,Ahero Traders,Ahero,deposit,250
TX01470,2024-12-22 21:52,Ruth Mutua,+254765990081,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,1070
TX01471,2024-12-22 22:13,Emmanuel Omondi,0725380344,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,1430
TX01472,2024-12-22 23:25,Samuel Kamau,0797288130,Kisumu,AG005,Ahero Traders,Ahero,deposit,1300
TX01473,2024-12-23 04:46,PETER MUTUA,+254728142270,Kisumu,AG006,Naivasha Electronics,Naivasha,send,4930
TX01474,2024-12-23 09:22,Wanjiru Nyambura,+254710343706,Kisumu,AG004,Kondele Traders,Kondele,deposit,6630
TX01475,2024-12-23 16:55,Brian Chebet,0724749319,Kisumu,AG004,Kondele Traders,Kondele,send,90
TX01476,2024-12-23 20:45,Tabitha Mutua,254756826189,Nakuru,AG006,Naivasha Electronics,Naivasha,withdrawal,1990
TX01477,2024-12-24 05:45,Kevin Ali,0736810718,Nairobi,AG001,Kibera Agency,Kibera,send,1120
TX01478,2024-12-24 06:30,Esther Mutua,0763337519,Kisumu,AG005,Ahero Traders,Ahero,send,2450
TX01479,2024-12-24 07:46,Peter Otieno,0756906200,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,850
TX01480,2024-12-24 18:40,Otieno Wanjiku,0739912527,Kisumu,AG004,Kondele Traders,Kondele,deposit,1630
TX01481,2024-12-25 11:14,Tabitha Ali,0714969608,Nyeri,AG012,Othaya Mobile Shop,Othaya,deposit,2470
TX01482,2024-12-25 11:18,Faith Chebet,0770855361,Kakamega,AG010,Mumias Agency,Mumias,deposit,1200
TX01483,2024-12-25 22:11,Peter Wafula,0741815015,Nairobi,AG002,Githurai Mobile Shop,Githurai,deposit,390
TX01484,2024-12-25 22:19,Tabitha Omondi,0799935367,Kakamega,AG010,Mumias Agency,Mumias,withdrawal,2470
TX01485,2024-12-26 14:07,RUTH KAMAU,0755338137,Mombasa,AG008,Likoni Agency,Likoni,withdrawal,1080
TX01486,2024-12-26 18:09,Esther Omondi,0721708124,Nyeri,AG009,Changamwe Electronics,Changamwe,deposit,1610
TX01487,2024-12-27 05:22,Amina Omondi,0734657335,Nyeri,AG012,Othaya Mobile Shop,Othaya,send,690
TX01488,2024-12-27 08:15,Esther Chebet,+254732335804,Kisumu,AG005,Ahero Traders,Ahero,withdrawal,2550
TX01489,2024-12-27 22:11,James Achieng,0724507260,Nakuru,AG006,Naivasha Electronics,Naivasha,send,2100
TX01490,2024-12-28 02:55,Ruth Kiprop,0717570364,Nairobi,AG003,CBD Mega Agency,CBD,deposit,6200
TX01491,2024-12-28 08:25,Faith Chebet,0765596236,Nakuru,AG001,Kibera Agency,Kibera,send,2490
TX01492,2024-12-28 19:01,Daniel Kiprop,0798585568,Nairobi,AG007,Molo Mobile Shop,Molo,deposit,5960
TX01493,2024-12-29 08:47,Esther Chebet,+254732335804,Kisumu,AG005,Ahero Traders,Ahero,deposit,1310
TX01494,2024-12-30 03:54,AMINA ALI,0751100442,Nakuru,AG006,Naivasha Electronics,Naivasha,deposit,1070
TX01495,2024-12-30 06:55,Esther Mutua,0763337519,Kisumu,AG005,Ahero Traders,Ahero,deposit,3230
TX01496,2024-12-30 17:17,Chebet Kiprop,254744309985,Nyeri,AG011,Karatina Traders,Karatina,deposit,1070
TX01497,2024-12-30 20:38,SAMUEL KAMAU,+254797288130,Kisumu,AG005,Ahero Traders,Ahero,deposit,5210
TX01498,2024-12-31 16:33,James Achieng,0724507260,Nakuru,AG007,Molo Mobile Shop,Molo,withdrawal,1640
TX01499,2024-12-31 16:55,Emmanuel Mutua,+254777249423,Mombasa,AG008,Likoni Agency,Likoni,send,590
TX01500,2024-12-31 17:54,Otieno Mutua,0793658336,Mombasa,AG009,Changamwe Electronics,Changamwe,deposit,3510
`;

/**
 * A SACCO's contribution ledger kept in a spreadsheet: one row per member per
 * month, with missing ID numbers, amounts typed as negative, inconsistent
 * name casing and rows entered twice.
 */
export const SACCO_LEDGER_CSV = `member_name,id_number,phone,month,contribution_ksh,loan_repayment_ksh
Achieng Kiprop,35256822,0729944219,2024-01,3000,1000
Achieng Omondi,28493754,0759545120,2024-01,-1000,0
achieng otieno,18673874,0758312299,2024-01,1500,2500
Achieng Wafula,26001932,0714689630,2024-01,1000,0
Amina Kiprop,15760236,0722551188,2024-01,500,0
Amina Kiprop,17269169,0779384930,2024-01,1500,0
Amina Njoroge,12601771,0765708906,2024-01,3000,2500
Baraka Kamau,35738043,0767813112,2024-01,2000,2500
baraka nyambura,39162716,0733560198,2024-01,1000,0
Brian Wafula,29041344,0759815881,2024-01,2000,2500
Brian Wanjiku,12337981,0764696489,2024-01,3000,0
Chebet Ali,21100714,0748997317,2024-01,1000,0
Chebet Mwangi,33421209,0724601219,2024-01,500,0
Cynthia Omondi,21208731,0728812190,2024-01,2000,0
Cynthia Wafula,23951817,0798245196,2024-01,1000,0
Duncan Achieng,23040059,0782473063,2024-01,1500,2500
Duncan Chebet,38076964,0714781353,2024-01,1000,0
Duncan Mwangi,11275997,0798841287,2024-01,3000,1000
Esther Odhiambo,36355682,0726245705,2024-01,1500,0
Esther Wafula,10968327,0785709766,2024-01,500,0
Hassan Nyambura,20033596,0797386821,2024-01,2000,2500
Hassan Odhiambo,17598475,0742671186,2024-01,1500,1000
Hassan Omondi,39674237,0779244568,2024-01,1500,0
Hassan Wafula,34377494,0779700696,2024-01,1500,0
Irene Mutua,19064408,0782208902,2024-01,1000,0
Irene Wafula,33949204,0785893692,2024-01,1000,0
Kevin Kamau,19795354,0782268688,2024-01,2000,1000
Kevin Kariuki,33237703,0786223920,2024-01,-1000,0
Kevin Kariuki,,0716747606,2024-01,1500,0
Kevin Kariuki,,0716747606,2024-01,1500,0
Lucy Mutua,13479229,0759266957,2024-01,2000,1000
lucy otieno,10085220,0799515459,2024-01,500,2500
Lucy Wanjiku,10624409,0720965667,2024-01,1000,2500
Mercy Ali,10676625,0715261953,2024-01,1000,1000
Mercy Ali,21028977,0767424073,2024-01,2000,1000
Mercy Kiprop,12320977,0780451183,2024-01,3000,0
Njeri Achieng,12131005,0743524707,2024-01,500,0
Njeri Kamau,17768380,0741398852,2024-01,1000,0
Njeri Kariuki,16136140,0773228053,2024-01,2000,0
Njeri Nyambura,30123800,0774976843,2024-01,2000,2500
Njeri Nyambura,39794385,0730491798,2024-01,1000,2500
Otieno Kiprop,19429642,0711187153,2024-01,1000,0
Otieno Wafula,37633503,0730540981,2024-01,1000,0
Peter Odhiambo,18291330,0794808595,2024-01,1000,0
Quincy Wafula,20208353,0716967656,2024-01,2000,2500
Tabitha Wafula,10515179,0719380507,2024-01,3000,1000
Umi Odhiambo,25199759,0761520151,2024-01,1000,1000
Victor Otieno,26360430,0748849399,2024-01,1000,0
Victor Wafula,32157701,0764973958,2024-01,1000,0
Victor Wanjiku,21155946,0713720959,2024-01,2000,0
Wanjiru Wafula,19149006,0792961750,2024-01,2000,1000
Zawadi Kamau,16188522,0714830077,2024-01,3000,0
Zawadi Kiprop,29233783,0766196243,2024-01,2000,2500
Zawadi Mutua,14505010,0780683634,2024-01,3000,2500
Zawadi Wafula,16448320,0771237141,2024-01,1000,0
Achieng Kiprop,35256822,0729944219,2024-02,1500,0
Achieng Omondi,28493754,0759545120,2024-02,3000,2500
Achieng Otieno,18673874,0758312299,2024-02,1500,0
Achieng Wafula,26001932,0714689630,2024-02,2000,1000
Amina Kiprop,15760236,0722551188,2024-02,500,0
Amina Kiprop,17269169,0779384930,2024-02,1500,0
Amina Njoroge,12601771,0765708906,2024-02,500,1000
Baraka Kamau,35738043,0767813112,2024-02,1000,0
Baraka Mutua,12697843,0772135031,2024-02,1500,0
Baraka Nyambura,39162716,0733560198,2024-02,500,1000
Brian Mutua,29286338,0729413047,2024-02,1000,2500
Brian Wafula,,0759815881,2024-02,1000,2500
Brian Wanjiku,12337981,0764696489,2024-02,500,0
Chebet Ali,21100714,0748997317,2024-02,1500,0
Chebet Mwangi,33421209,0724601219,2024-02,1500,0
Cynthia Omondi,21208731,0728812190,2024-02,1500,2500
Cynthia Wafula,23951817,0798245196,2024-02,1000,0
Daniel Wafula,20795340,0770883724,2024-02,500,0
Daniel Wafula,20795340,0770883724,2024-02,500,0
Duncan Achieng,23040059,0782473063,2024-02,500,0
Duncan Chebet,38076964,0714781353,2024-02,1500,2500
Duncan Kiprop,21568946,0744779489,2024-02,1500,1000
Duncan Mwangi,11275997,0798841287,2024-02,1500,0
Esther Odhiambo,36355682,0726245705,2024-02,500,0
Hassan Odhiambo,17598475,0742671186,2024-02,1500,0
Hassan Omondi,39674237,0779244568,2024-02,1000,2500
Hassan Wafula,34377494,0779700696,2024-02,1000,0
Irene Mutua,,0782208902,2024-02,2000,0
Irene Wafula,33949204,0785893692,2024-02,2000,2500
Kevin Kamau,19795354,0782268688,2024-02,3000,0
Kevin Kariuki,29199240,0716747606,2024-02,500,1000
Lucy Mutua,13479229,0759266957,2024-02,1500,0
Lucy Wanjiku,10624409,0720965667,2024-02,500,0
Mercy Ali,10676625,0715261953,2024-02,3000,1000
Mercy Kiprop,12320977,0780451183,2024-02,1000,1000
Njeri Achieng,,0743524707,2024-02,3000,0
Njeri Kamau,17768380,0741398852,2024-02,500,1000
Otieno Kiprop,19429642,0711187153,2024-02,1500,0
Otieno Wafula,37633503,0730540981,2024-02,2000,1000
Peter Odhiambo,18291330,0794808595,2024-02,1000,1000
Quincy Wafula,20208353,0716967656,2024-02,2000,0
Tabitha Wafula,10515179,0719380507,2024-02,1000,2500
Umi Odhiambo,25199759,0761520151,2024-02,500,1000
Victor Otieno,26360430,0748849399,2024-02,3000,0
Victor Wafula,32157701,0764973958,2024-02,1000,0
Victor Wanjiku,,0713720959,2024-02,1000,0
Wanjiru Mutua,13515343,0771133225,2024-02,2000,2500
Wanjiru Wafula,19149006,0792961750,2024-02,500,2500
Zawadi Kamau,16188522,0714830077,2024-02,500,0
Zawadi Kiprop,29233783,0766196243,2024-02,500,1000
Zawadi Mutua,14505010,0780683634,2024-02,2000,0
Achieng Omondi,28493754,0759545120,2024-03,3000,0
Achieng Otieno,18673874,0758312299,2024-03,1500,2500
Amina Kiprop,,0722551188,2024-03,2000,0
Amina Kiprop,17269169,0779384930,2024-03,3000,0
Amina Njoroge,12601771,0765708906,2024-03,3000,0
Baraka Kamau,35738043,0767813112,2024-03,1500,0
Baraka Mutua,12697843,0772135031,2024-03,2000,1000
Baraka Nyambura,39162716,0733560198,2024-03,1000,0
Brian Mutua,29286338,0729413047,2024-03,500,0
Brian Wafula,29041344,0759815881,2024-03,1000,1000
Chebet Ali,21100714,0748997317,2024-03,1000,1000
Chebet Mwangi,33421209,0724601219,2024-03,1500,2500
Cynthia Omondi,21208731,0728812190,2024-03,1500,0
Cynthia Wafula,23951817,0798245196,2024-03,2000,0
Daniel Wafula,20795340,0770883724,2024-03,1000,2500
Duncan Achieng,23040059,0782473063,2024-03,2000,0
Duncan Chebet,38076964,0714781353,2024-03,1500,0
Duncan Kiprop,21568946,0744779489,2024-03,1500,0
Esther Odhiambo,36355682,0726245705,2024-03,3000,1000
Esther Wafula,10968327,0785709766,2024-03,1000,1000
Esther Wafula,10968327,0785709766,2024-03,1000,1000
Hassan Nyambura,20033596,0797386821,2024-03,2000,0
Hassan Odhiambo,17598475,0742671186,2024-03,1500,0
hassan wafula,34377494,0779700696,2024-03,1500,0
Irene Mutua,19064408,0782208902,2024-03,1500,0
Irene Wafula,33949204,0785893692,2024-03,3000,0
Kevin Kamau,19795354,0782268688,2024-03,1000,0
Kevin Kariuki,29199240,0716747606,2024-03,500,0
Lucy Mutua,13479229,0759266957,2024-03,500,0
Lucy Otieno,10085220,0799515459,2024-03,1500,0
Lucy Wanjiku,10624409,0720965667,2024-03,1500,0
Mercy Ali,10676625,0715261953,2024-03,2000,2500
Mercy Ali,21028977,0767424073,2024-03,3000,2500
Njeri Achieng,12131005,0743524707,2024-03,1500,0
Njeri Kamau,17768380,0741398852,2024-03,-1500,1000
Njeri Kariuki,16136140,0773228053,2024-03,500,0
Njeri Nyambura,30123800,0774976843,2024-03,2000,0
Njeri Nyambura,39794385,0730491798,2024-03,3000,0
Otieno Kiprop,19429642,0711187153,2024-03,500,1000
Otieno Wafula,37633503,0730540981,2024-03,2000,0
Peter Odhiambo,18291330,0794808595,2024-03,1000,0
Tabitha Wafula,10515179,0719380507,2024-03,1500,0
Victor Otieno,26360430,0748849399,2024-03,500,1000
Victor Wafula,32157701,0764973958,2024-03,1500,0
Victor Wanjiku,21155946,0713720959,2024-03,2000,0
Wanjiru Mutua,13515343,0771133225,2024-03,1000,2500
Wanjiru Mutua,13515343,0771133225,2024-03,1000,2500
Wanjiru Wafula,19149006,0792961750,2024-03,1000,0
Yusuf Njoroge,39988616,0720214280,2024-03,1000,1000
Zawadi Kamau,16188522,0714830077,2024-03,1500,0
Zawadi Kamau,16188522,0714830077,2024-03,1500,0
Zawadi Kiprop,29233783,0766196243,2024-03,2000,0
Zawadi Mutua,14505010,0780683634,2024-03,1500,1000
Zawadi Wafula,16448320,0771237141,2024-03,1000,0
Achieng Kiprop,35256822,0729944219,2024-04,3000,0
Achieng Omondi,28493754,0759545120,2024-04,500,2500
Achieng Otieno,18673874,0758312299,2024-04,1000,1000
Achieng Wafula,26001932,0714689630,2024-04,1500,2500
Amina Kiprop,15760236,0722551188,2024-04,1500,2500
Amina Kiprop,17269169,0779384930,2024-04,1500,0
Amina Njoroge,12601771,0765708906,2024-04,3000,0
Baraka Kamau,35738043,0767813112,2024-04,3000,0
Baraka Mutua,12697843,0772135031,2024-04,1000,1000
Baraka Nyambura,39162716,0733560198,2024-04,2000,1000
Brian Mutua,29286338,0729413047,2024-04,1500,1000
brian wafula,29041344,0759815881,2024-04,1000,0
Brian Wanjiku,12337981,0764696489,2024-04,1000,0
Chebet Mwangi,33421209,0724601219,2024-04,1000,2500
Cynthia Omondi,21208731,0728812190,2024-04,2000,0
Cynthia Wafula,23951817,0798245196,2024-04,3000,0
Daniel Wafula,20795340,0770883724,2024-04,1500,2500
Duncan Achieng,23040059,0782473063,2024-04,500,0
Duncan Chebet,38076964,0714781353,2024-04,500,1000
Duncan Kiprop,21568946,0744779489,2024-04,500,1000
Duncan Mwangi,11275997,0798841287,2024-04,1000,0
Esther Wafula,10968327,0785709766,2024-04,3000,0
Hassan Nyambura,20033596,0797386821,2024-04,3000,1000
hassan odhiambo,17598475,0742671186,2024-04,1500,1000
Hassan Omondi,39674237,0779244568,2024-04,1000,1000
Hassan Wafula,34377494,0779700696,2024-04,1500,0
Irene Mutua,19064408,0782208902,2024-04,1500,0
Irene Wafula,33949204,0785893692,2024-04,1500,1000
Kevin Kamau,19795354,0782268688,2024-04,500,0
Kevin Kariuki,33237703,0786223920,2024-04,3000,1000
Lucy Mutua,13479229,0759266957,2024-04,1500,0
Lucy Otieno,10085220,0799515459,2024-04,500,1000
Lucy Wanjiku,10624409,0720965667,2024-04,500,2500
Mercy Ali,10676625,0715261953,2024-04,2000,0
Mercy Ali,21028977,0767424073,2024-04,500,1000
mercy kiprop,12320977,0780451183,2024-04,500,0
Njeri Achieng,12131005,0743524707,2024-04,1000,0
Njeri Kamau,17768380,0741398852,2024-04,2000,0
Njeri Kariuki,16136140,0773228053,2024-04,1000,0
Njeri Nyambura,30123800,0774976843,2024-04,1000,0
Otieno Kiprop,19429642,0711187153,2024-04,3000,2500
Otieno Wafula,37633503,0730540981,2024-04,3000,1000
Tabitha Wafula,10515179,0719380507,2024-04,500,0
Umi Odhiambo,25199759,0761520151,2024-04,500,0
Victor Wafula,32157701,0764973958,2024-04,500,0
victor wanjiku,21155946,0713720959,2024-04,2000,0
Wanjiru Mutua,13515343,0771133225,2024-04,2000,0
Wanjiru Wafula,19149006,0792961750,2024-04,1500,2500
Yusuf Njoroge,39988616,0720214280,2024-04,2000,0
Zawadi Kamau,16188522,0714830077,2024-04,1000,0
Zawadi Kamau,16188522,0714830077,2024-04,1000,0
Zawadi Kiprop,29233783,0766196243,2024-04,1000,0
Zawadi Mutua,14505010,0780683634,2024-04,3000,0
Zawadi Wafula,16448320,0771237141,2024-04,1000,0
Achieng Kiprop,35256822,0729944219,2024-05,3000,0
Achieng Omondi,28493754,0759545120,2024-05,500,0
Achieng Otieno,18673874,0758312299,2024-05,1500,2500
Amina Kiprop,15760236,0722551188,2024-05,1500,2500
Amina Kiprop,17269169,0779384930,2024-05,1000,0
Amina Njoroge,12601771,0765708906,2024-05,3000,0
Amina Njoroge,12601771,0765708906,2024-05,3000,0
Baraka Kamau,35738043,0767813112,2024-05,1000,0
baraka mutua,12697843,0772135031,2024-05,2000,1000
Baraka Nyambura,39162716,0733560198,2024-05,3000,1000
Brian Mutua,29286338,0729413047,2024-05,1500,1000
Brian Wafula,29041344,0759815881,2024-05,3000,0
Brian Wanjiku,12337981,0764696489,2024-05,2000,2500
Chebet Mwangi,33421209,0724601219,2024-05,1000,1000
Cynthia Wafula,23951817,0798245196,2024-05,3000,0
Daniel Wafula,20795340,0770883724,2024-05,-500,0
Duncan Achieng,23040059,0782473063,2024-05,2000,0
Duncan Chebet,38076964,0714781353,2024-05,2000,0
Duncan Kiprop,21568946,0744779489,2024-05,1500,0
Duncan Kiprop,21568946,0744779489,2024-05,1500,0
Duncan Mwangi,11275997,0798841287,2024-05,2000,0
Esther Odhiambo,36355682,0726245705,2024-05,2000,0
Esther Wafula,10968327,0785709766,2024-05,3000,0
Hassan Nyambura,20033596,0797386821,2024-05,1500,1000
Hassan Odhiambo,17598475,0742671186,2024-05,500,0
Hassan Wafula,34377494,0779700696,2024-05,500,0
Irene Wafula,33949204,0785893692,2024-05,3000,0
Kevin Kamau,19795354,0782268688,2024-05,3000,0
Kevin Kariuki,33237703,0786223920,2024-05,2000,1000
Kevin Kariuki,29199240,0716747606,2024-05,500,0
Lucy Mutua,13479229,0759266957,2024-05,1000,1000
Lucy Otieno,10085220,0799515459,2024-05,3000,0
Lucy Wanjiku,10624409,0720965667,2024-05,3000,1000
Mercy Ali,10676625,0715261953,2024-05,2000,0
Mercy Ali,21028977,0767424073,2024-05,1500,1000
Mercy Kiprop,12320977,0780451183,2024-05,1500,0
Njeri Achieng,12131005,0743524707,2024-05,500,1000
Njeri Kamau,17768380,0741398852,2024-05,1500,1000
Njeri Kariuki,16136140,0773228053,2024-05,1000,0
Njeri Nyambura,30123800,0774976843,2024-05,1500,2500
Njeri Nyambura,39794385,0730491798,2024-05,1500,0
Otieno Kiprop,19429642,0711187153,2024-05,1000,0
Otieno Wafula,37633503,0730540981,2024-05,2000,0
Peter Odhiambo,18291330,0794808595,2024-05,500,1000
quincy wafula,20208353,0716967656,2024-05,500,0
Tabitha Wafula,10515179,0719380507,2024-05,2000,2500
Umi Odhiambo,25199759,0761520151,2024-05,-500,0
Victor Otieno,26360430,0748849399,2024-05,1500,0
victor wafula,32157701,0764973958,2024-05,3000,2500
Victor Wanjiku,21155946,0713720959,2024-05,1000,1000
Victor Wanjiku,21155946,0713720959,2024-05,1000,1000
Wanjiru Mutua,13515343,0771133225,2024-05,500,2500
Wanjiru Wafula,19149006,0792961750,2024-05,3000,0
Yusuf Njoroge,39988616,0720214280,2024-05,1000,0
Yusuf Njoroge,39988616,0720214280,2024-05,1000,0
zawadi kamau,16188522,0714830077,2024-05,3000,0
Zawadi Kiprop,29233783,0766196243,2024-05,3000,1000
Zawadi Mutua,14505010,0780683634,2024-05,1000,0
Zawadi Mutua,14505010,0780683634,2024-05,1000,0
Zawadi Wafula,16448320,0771237141,2024-05,500,1000
Achieng Kiprop,35256822,0729944219,2024-06,3000,0
Achieng Wafula,26001932,0714689630,2024-06,500,0
Amina Kiprop,15760236,0722551188,2024-06,2000,0
Amina Kiprop,,0779384930,2024-06,1000,1000
Amina Njoroge,12601771,0765708906,2024-06,1500,1000
Baraka Kamau,35738043,0767813112,2024-06,1500,2500
Baraka Mutua,12697843,0772135031,2024-06,1000,2500
Baraka Nyambura,39162716,0733560198,2024-06,1000,0
brian mutua,29286338,0729413047,2024-06,1000,0
Brian Wanjiku,,0764696489,2024-06,2000,0
Brian Wanjiku,,0764696489,2024-06,2000,0
Chebet Ali,21100714,0748997317,2024-06,500,0
Chebet Mwangi,33421209,0724601219,2024-06,2000,2500
Cynthia Omondi,21208731,0728812190,2024-06,2000,0
Cynthia Wafula,23951817,0798245196,2024-06,2000,2500
Daniel Wafula,20795340,0770883724,2024-06,2000,1000
duncan achieng,23040059,0782473063,2024-06,3000,1000
duncan kiprop,21568946,0744779489,2024-06,3000,0
Duncan Mwangi,11275997,0798841287,2024-06,1500,1000
Esther Odhiambo,36355682,0726245705,2024-06,1000,0
Esther Wafula,10968327,0785709766,2024-06,1000,1000
Hassan Nyambura,20033596,0797386821,2024-06,3000,1000
Hassan Odhiambo,17598475,0742671186,2024-06,2000,1000
Hassan Wafula,34377494,0779700696,2024-06,3000,2500
Irene Wafula,33949204,0785893692,2024-06,2000,1000
Kevin Kariuki,33237703,0786223920,2024-06,3000,1000
Kevin Kariuki,29199240,0716747606,2024-06,500,0
Lucy Mutua,13479229,0759266957,2024-06,2000,0
Lucy Otieno,10085220,0799515459,2024-06,3000,0
Lucy Wanjiku,10624409,0720965667,2024-06,500,0
Mercy Ali,21028977,0767424073,2024-06,1500,1000
Mercy Kiprop,12320977,0780451183,2024-06,3000,0
Njeri Achieng,12131005,0743524707,2024-06,2000,2500
Njeri Kamau,17768380,0741398852,2024-06,1500,0
Njeri Kariuki,16136140,0773228053,2024-06,500,0
Njeri Nyambura,30123800,0774976843,2024-06,1500,0
Njeri Nyambura,39794385,0730491798,2024-06,500,0
Otieno Wafula,37633503,0730540981,2024-06,2000,0
Peter Odhiambo,18291330,0794808595,2024-06,1000,1000
umi odhiambo,25199759,0761520151,2024-06,2000,2500
umi odhiambo,25199759,0761520151,2024-06,2000,2500
Victor Otieno,26360430,0748849399,2024-06,1500,0
Victor Wafula,32157701,0764973958,2024-06,3000,0
Victor Wanjiku,21155946,0713720959,2024-06,500,0
Wanjiru Mutua,13515343,0771133225,2024-06,2000,0
Wanjiru Wafula,19149006,0792961750,2024-06,1500,0
Yusuf Njoroge,39988616,0720214280,2024-06,3000,0
Zawadi Mutua,14505010,0780683634,2024-06,1000,0
Zawadi Wafula,16448320,0771237141,2024-06,3000,2500
Achieng Omondi,28493754,0759545120,2024-07,1000,0
Achieng Otieno,18673874,0758312299,2024-07,3000,0
Achieng Wafula,26001932,0714689630,2024-07,1000,2500
Amina Kiprop,15760236,0722551188,2024-07,500,2500
Amina Kiprop,17269169,0779384930,2024-07,2000,2500
Baraka Kamau,35738043,0767813112,2024-07,1000,0
Baraka Mutua,12697843,0772135031,2024-07,-2000,1000
Baraka Nyambura,39162716,0733560198,2024-07,500,1000
Brian Mutua,29286338,0729413047,2024-07,1000,0
Brian Wafula,29041344,0759815881,2024-07,3000,2500
Brian Wanjiku,,0764696489,2024-07,1500,0
Chebet Ali,21100714,0748997317,2024-07,3000,2500
Chebet Mwangi,33421209,0724601219,2024-07,500,0
Cynthia Wafula,23951817,0798245196,2024-07,3000,2500
Duncan Achieng,23040059,0782473063,2024-07,3000,0
Duncan Chebet,38076964,0714781353,2024-07,1500,0
Duncan Kiprop,21568946,0744779489,2024-07,3000,1000
Duncan Mwangi,11275997,0798841287,2024-07,1500,2500
Esther Odhiambo,36355682,0726245705,2024-07,2000,0
Hassan Nyambura,20033596,0797386821,2024-07,3000,2500
Hassan Odhiambo,17598475,0742671186,2024-07,1000,2500
Hassan Omondi,39674237,0779244568,2024-07,2000,2500
Hassan Wafula,34377494,0779700696,2024-07,1500,0
irene mutua,19064408,0782208902,2024-07,3000,1000
irene mutua,19064408,0782208902,2024-07,3000,1000
Irene Wafula,33949204,0785893692,2024-07,1500,0
Kevin Kamau,19795354,0782268688,2024-07,3000,1000
Kevin Kariuki,29199240,0716747606,2024-07,2000,1000
Lucy Mutua,13479229,0759266957,2024-07,2000,0
Lucy Mutua,13479229,0759266957,2024-07,2000,0
Lucy Otieno,10085220,0799515459,2024-07,500,2500
lucy wanjiku,10624409,0720965667,2024-07,500,2500
Mercy Ali,10676625,0715261953,2024-07,3000,0
Mercy Kiprop,12320977,0780451183,2024-07,1000,0
Njeri Kariuki,16136140,0773228053,2024-07,2000,2500
Njeri Nyambura,30123800,0774976843,2024-07,2000,0
Njeri Nyambura,39794385,0730491798,2024-07,3000,2500
Otieno Kiprop,19429642,0711187153,2024-07,3000,0
Otieno Wafula,37633503,0730540981,2024-07,3000,0
Peter Odhiambo,18291330,0794808595,2024-07,3000,0
Quincy Wafula,20208353,0716967656,2024-07,500,0
Tabitha Wafula,10515179,0719380507,2024-07,500,0
Umi Odhiambo,25199759,0761520151,2024-07,500,0
Victor Otieno,26360430,0748849399,2024-07,3000,1000
Victor Wafula,32157701,0764973958,2024-07,3000,0
Victor Wanjiku,21155946,0713720959,2024-07,3000,0
wanjiru mutua,13515343,0771133225,2024-07,2000,0
Wanjiru Wafula,19149006,0792961750,2024-07,3000,2500
Yusuf Njoroge,39988616,0720214280,2024-07,3000,2500
Zawadi Kamau,,0714830077,2024-07,1000,0
Zawadi Kiprop,29233783,0766196243,2024-07,500,0
Zawadi Mutua,14505010,0780683634,2024-07,500,1000
Zawadi Wafula,16448320,0771237141,2024-07,1000,2500
Achieng Omondi,28493754,0759545120,2024-08,500,0
Achieng Wafula,26001932,0714689630,2024-08,3000,0
Amina Kiprop,15760236,0722551188,2024-08,1000,0
Amina Kiprop,17269169,0779384930,2024-08,1000,1000
Amina Njoroge,12601771,0765708906,2024-08,3000,1000
Baraka Kamau,35738043,0767813112,2024-08,3000,0
Baraka Mutua,,0772135031,2024-08,500,0
Baraka Nyambura,39162716,0733560198,2024-08,1000,0
Brian Wanjiku,12337981,0764696489,2024-08,2000,1000
Chebet Ali,21100714,0748997317,2024-08,1500,0
Chebet Mwangi,33421209,0724601219,2024-08,2000,0
Cynthia Wafula,23951817,0798245196,2024-08,3000,0
Daniel Wafula,20795340,0770883724,2024-08,2000,0
Duncan Achieng,23040059,0782473063,2024-08,1500,0
Duncan Chebet,38076964,0714781353,2024-08,1000,1000
Duncan Kiprop,21568946,0744779489,2024-08,1500,0
Duncan Mwangi,11275997,0798841287,2024-08,1000,0
esther wafula,10968327,0785709766,2024-08,3000,1000
Hassan Nyambura,20033596,0797386821,2024-08,1500,2500
Hassan Odhiambo,17598475,0742671186,2024-08,2000,1000
Hassan Omondi,39674237,0779244568,2024-08,3000,0
Hassan Wafula,34377494,0779700696,2024-08,2000,0
Irene Mutua,19064408,0782208902,2024-08,3000,1000
Irene Wafula,33949204,0785893692,2024-08,1500,2500
Kevin Kamau,19795354,0782268688,2024-08,1500,0
Kevin Kariuki,33237703,0786223920,2024-08,2000,2500
Kevin Kariuki,29199240,0716747606,2024-08,2000,0
Lucy Mutua,13479229,0759266957,2024-08,1500,0
Lucy Otieno,10085220,0799515459,2024-08,3000,0
Lucy Wanjiku,10624409,0720965667,2024-08,2000,2500
Mercy Ali,10676625,0715261953,2024-08,1000,0
Mercy Ali,,0767424073,2024-08,2000,0
Mercy Kiprop,12320977,0780451183,2024-08,1500,0
Njeri Achieng,12131005,0743524707,2024-08,2000,1000
Njeri Kariuki,16136140,0773228053,2024-08,1500,0
Njeri Nyambura,30123800,0774976843,2024-08,1500,0
Njeri Nyambura,39794385,0730491798,2024-08,500,0
Otieno Kiprop,19429642,0711187153,2024-08,500,2500
Otieno Wafula,37633503,0730540981,2024-08,500,0
Tabitha Wafula,10515179,0719380507,2024-08,1500,0
Umi Odhiambo,25199759,0761520151,2024-08,500,1000
Victor Otieno,26360430,0748849399,2024-08,3000,0
Victor Wafula,32157701,0764973958,2024-08,2000,0
Victor Wanjiku,21155946,0713720959,2024-08,500,0
Wanjiru Mutua,13515343,0771133225,2024-08,2000,2500
Wanjiru Wafula,19149006,0792961750,2024-08,2000,0
Zawadi Kamau,16188522,0714830077,2024-08,3000,2500
Zawadi Kiprop,29233783,0766196243,2024-08,2000,2500
Zawadi Wafula,16448320,0771237141,2024-08,2000,2500
Achieng Kiprop,35256822,0729944219,2024-09,1000,2500
Achieng Omondi,28493754,0759545120,2024-09,500,2500
Achieng Otieno,18673874,0758312299,2024-09,3000,2500
Achieng Wafula,26001932,0714689630,2024-09,1000,0
Amina Kiprop,15760236,0722551188,2024-09,3000,1000
Amina Kiprop,17269169,0779384930,2024-09,500,0
Amina Njoroge,12601771,0765708906,2024-09,3000,2500
Baraka Kamau,35738043,0767813112,2024-09,1000,0
Baraka Mutua,12697843,0772135031,2024-09,2000,0
Baraka Nyambura,,0733560198,2024-09,3000,2500
Brian Mutua,29286338,0729413047,2024-09,2000,0
Brian Wafula,29041344,0759815881,2024-09,500,2500
Brian Wanjiku,12337981,0764696489,2024-09,1000,0
Chebet Ali,21100714,0748997317,2024-09,500,0
chebet mwangi,33421209,0724601219,2024-09,2000,0
Cynthia Omondi,21208731,0728812190,2024-09,1000,2500
Cynthia Wafula,23951817,0798245196,2024-09,-1000,1000
Daniel Wafula,20795340,0770883724,2024-09,2000,0
Duncan Achieng,23040059,0782473063,2024-09,2000,1000
duncan chebet,38076964,0714781353,2024-09,1000,2500
Duncan Kiprop,21568946,0744779489,2024-09,2000,1000
Duncan Mwangi,11275997,0798841287,2024-09,500,2500
Esther Wafula,10968327,0785709766,2024-09,-1500,0
Hassan Nyambura,20033596,0797386821,2024-09,3000,1000
hassan odhiambo,17598475,0742671186,2024-09,500,0
Hassan Omondi,39674237,0779244568,2024-09,1500,0
Hassan Wafula,34377494,0779700696,2024-09,1000,0
Irene Mutua,19064408,0782208902,2024-09,3000,0
Irene Wafula,33949204,0785893692,2024-09,3000,0
Kevin Kamau,19795354,0782268688,2024-09,2000,1000
Kevin Kariuki,33237703,0786223920,2024-09,2000,0
Kevin Kariuki,29199240,0716747606,2024-09,3000,0
Lucy Otieno,,0799515459,2024-09,2000,2500
Mercy Ali,10676625,0715261953,2024-09,1500,1000
Njeri Achieng,12131005,0743524707,2024-09,500,0
Njeri Kamau,17768380,0741398852,2024-09,-3000,2500
Njeri Kariuki,16136140,0773228053,2024-09,1000,2500
Njeri Nyambura,39794385,0730491798,2024-09,3000,2500
Otieno Kiprop,19429642,0711187153,2024-09,3000,0
Otieno Wafula,37633503,0730540981,2024-09,3000,0
Peter Odhiambo,18291330,0794808595,2024-09,3000,2500
Tabitha Wafula,10515179,0719380507,2024-09,1500,2500
Umi Odhiambo,25199759,0761520151,2024-09,1500,1000
Victor Wafula,32157701,0764973958,2024-09,500,1000
Victor Wanjiku,21155946,0713720959,2024-09,2000,0
Wanjiru Wafula,19149006,0792961750,2024-09,500,0
Yusuf Njoroge,39988616,0720214280,2024-09,500,0
Zawadi Kamau,16188522,0714830077,2024-09,2000,2500
Zawadi Kiprop,29233783,0766196243,2024-09,2000,2500
Zawadi Mutua,14505010,0780683634,2024-09,1000,0
Zawadi Wafula,16448320,0771237141,2024-09,1000,2500
Achieng Kiprop,35256822,0729944219,2024-10,1500,1000
achieng omondi,28493754,0759545120,2024-10,3000,0
Achieng Wafula,26001932,0714689630,2024-10,1000,0
Amina Kiprop,15760236,0722551188,2024-10,1500,0
Amina Kiprop,17269169,0779384930,2024-10,2000,2500
Baraka Kamau,35738043,0767813112,2024-10,1000,0
Baraka Nyambura,39162716,0733560198,2024-10,500,2500
Brian Mutua,29286338,0729413047,2024-10,3000,0
Brian Wafula,29041344,0759815881,2024-10,1000,1000
Brian Wanjiku,12337981,0764696489,2024-10,500,2500
Chebet Ali,21100714,0748997317,2024-10,3000,0
Cynthia Omondi,21208731,0728812190,2024-10,1000,0
Cynthia Wafula,23951817,0798245196,2024-10,1000,1000
Daniel Wafula,20795340,0770883724,2024-10,2000,2500
Duncan Achieng,23040059,0782473063,2024-10,2000,0
Duncan Chebet,38076964,0714781353,2024-10,2000,0
Duncan Kiprop,21568946,0744779489,2024-10,1500,0
Esther Odhiambo,36355682,0726245705,2024-10,500,1000
hassan nyambura,20033596,0797386821,2024-10,3000,1000
Hassan Odhiambo,17598475,0742671186,2024-10,2000,0
Hassan Omondi,39674237,0779244568,2024-10,3000,0
Hassan Wafula,34377494,0779700696,2024-10,2000,0
Irene Mutua,19064408,0782208902,2024-10,3000,1000
Irene Wafula,33949204,0785893692,2024-10,2000,0
Kevin Kamau,19795354,0782268688,2024-10,1000,2500
Kevin Kariuki,29199240,0716747606,2024-10,3000,1000
Lucy Mutua,13479229,0759266957,2024-10,3000,2500
Lucy Wanjiku,10624409,0720965667,2024-10,3000,1000
Mercy Ali,10676625,0715261953,2024-10,2000,1000
Mercy Ali,21028977,0767424073,2024-10,2000,0
Mercy Kiprop,12320977,0780451183,2024-10,1000,0
Njeri Achieng,12131005,0743524707,2024-10,500,2500
Njeri Kamau,17768380,0741398852,2024-10,1000,0
Njeri Kariuki,16136140,0773228053,2024-10,2000,0
Njeri Nyambura,30123800,0774976843,2024-10,1000,1000
Njeri Nyambura,39794385,0730491798,2024-10,3000,0
Otieno Kiprop,19429642,0711187153,2024-10,1500,0
Otieno Wafula,37633503,0730540981,2024-10,500,0
Peter Odhiambo,18291330,0794808595,2024-10,3000,0
Quincy Wafula,20208353,0716967656,2024-10,500,1000
Tabitha Wafula,10515179,0719380507,2024-10,1000,1000
Victor Otieno,26360430,0748849399,2024-10,500,1000
Victor Wafula,32157701,0764973958,2024-10,1000,0
wanjiru mutua,13515343,0771133225,2024-10,2000,2500
Wanjiru Wafula,19149006,0792961750,2024-10,500,2500
Yusuf Njoroge,,0720214280,2024-10,3000,2500
Zawadi Kamau,16188522,0714830077,2024-10,3000,2500
Zawadi Kiprop,29233783,0766196243,2024-10,500,0
Zawadi Mutua,14505010,0780683634,2024-10,1000,2500
Zawadi Wafula,16448320,0771237141,2024-10,500,0
Achieng Kiprop,35256822,0729944219,2024-11,500,0
achieng omondi,28493754,0759545120,2024-11,1500,0
Achieng Wafula,26001932,0714689630,2024-11,500,0
Amina Kiprop,15760236,0722551188,2024-11,3000,0
Amina Kiprop,17269169,0779384930,2024-11,2000,1000
Amina Njoroge,12601771,0765708906,2024-11,1500,2500
Baraka Kamau,35738043,0767813112,2024-11,500,0
Baraka Mutua,12697843,0772135031,2024-11,1500,0
Baraka Nyambura,39162716,0733560198,2024-11,1000,0
Brian Mutua,29286338,0729413047,2024-11,500,1000
Brian Wafula,29041344,0759815881,2024-11,500,0
Brian Wanjiku,12337981,0764696489,2024-11,1000,0
Chebet Ali,21100714,0748997317,2024-11,1000,0
Chebet Mwangi,33421209,0724601219,2024-11,-1000,0
Cynthia Omondi,21208731,0728812190,2024-11,500,1000
Cynthia Wafula,23951817,0798245196,2024-11,2000,0
duncan achieng,23040059,0782473063,2024-11,2000,2500
Duncan Chebet,38076964,0714781353,2024-11,500,0
Duncan Kiprop,21568946,0744779489,2024-11,3000,0
Duncan Mwangi,11275997,0798841287,2024-11,1500,0
Esther Odhiambo,36355682,0726245705,2024-11,1500,1000
Esther Wafula,10968327,0785709766,2024-11,1000,1000
Hassan Nyambura,20033596,0797386821,2024-11,1500,1000
Hassan Omondi,39674237,0779244568,2024-11,1500,0
Hassan Wafula,34377494,0779700696,2024-11,1500,1000
Irene Wafula,33949204,0785893692,2024-11,3000,1000
Kevin Kamau,19795354,0782268688,2024-11,1500,1000
Kevin Kariuki,29199240,0716747606,2024-11,2000,1000
Lucy Mutua,13479229,0759266957,2024-11,2000,0
Lucy Otieno,10085220,0799515459,2024-11,500,0
Mercy Ali,10676625,0715261953,2024-11,3000,0
Mercy Ali,21028977,0767424073,2024-11,2000,2500
Mercy Kiprop,12320977,0780451183,2024-11,2000,0
Njeri Achieng,12131005,0743524707,2024-11,1500,1000
Njeri Kamau,17768380,0741398852,2024-11,500,0
Njeri Kariuki,16136140,0773228053,2024-11,500,0
Njeri Nyambura,30123800,0774976843,2024-11,1000,0
Njeri Nyambura,39794385,0730491798,2024-11,2000,0
Otieno Kiprop,19429642,0711187153,2024-11,2000,0
Otieno Wafula,37633503,0730540981,2024-11,500,0
Quincy Wafula,20208353,0716967656,2024-11,500,2500
Tabitha Wafula,10515179,0719380507,2024-11,3000,2500
Victor Otieno,26360430,0748849399,2024-11,500,1000
Victor Wafula,,0764973958,2024-11,3000,0
Wanjiru Mutua,13515343,0771133225,2024-11,500,0
Wanjiru Wafula,19149006,0792961750,2024-11,3000,2500
Yusuf Njoroge,39988616,0720214280,2024-11,1500,2500
Zawadi Kamau,16188522,0714830077,2024-11,2000,0
Zawadi Kiprop,29233783,0766196243,2024-11,2000,0
Zawadi Mutua,14505010,0780683634,2024-11,1000,0
Achieng Kiprop,35256822,0729944219,2024-12,3000,0
Achieng Omondi,28493754,0759545120,2024-12,500,0
Achieng Otieno,18673874,0758312299,2024-12,1500,0
Amina Kiprop,15760236,0722551188,2024-12,1000,0
Amina Kiprop,17269169,0779384930,2024-12,3000,1000
Amina Njoroge,12601771,0765708906,2024-12,3000,0
Baraka Mutua,12697843,0772135031,2024-12,3000,0
baraka nyambura,39162716,0733560198,2024-12,2000,0
Brian Mutua,29286338,0729413047,2024-12,3000,0
Brian Wafula,29041344,0759815881,2024-12,1000,2500
Chebet Ali,21100714,0748997317,2024-12,2000,1000
Chebet Mwangi,33421209,0724601219,2024-12,500,0
Cynthia Omondi,21208731,0728812190,2024-12,1000,0
Cynthia Wafula,23951817,0798245196,2024-12,3000,0
Daniel Wafula,20795340,0770883724,2024-12,1000,0
Duncan Achieng,,0782473063,2024-12,500,0
Duncan Chebet,38076964,0714781353,2024-12,3000,1000
Duncan Mwangi,11275997,0798841287,2024-12,3000,2500
Esther Odhiambo,36355682,0726245705,2024-12,500,2500
Esther Wafula,10968327,0785709766,2024-12,500,0
Hassan Nyambura,20033596,0797386821,2024-12,2000,0
Hassan Odhiambo,17598475,0742671186,2024-12,3000,0
Hassan Omondi,39674237,0779244568,2024-12,1000,0
Irene Mutua,19064408,0782208902,2024-12,1500,0
Irene Wafula,33949204,0785893692,2024-12,3000,1000
Kevin Kamau,19795354,0782268688,2024-12,-500,2500
Kevin Kariuki,33237703,0786223920,2024-12,500,1000
Kevin Kariuki,29199240,0716747606,2024-12,1500,2500
Lucy Mutua,13479229,0759266957,2024-12,1000,2500
Lucy Otieno,10085220,0799515459,2024-12,1500,0
Lucy Wanjiku,10624409,0720965667,2024-12,1500,0
Mercy Ali,10676625,0715261953,2024-12,2000,1000
Mercy Kiprop,12320977,0780451183,2024-12,1000,0
Njeri Achieng,12131005,0743524707,2024-12,500,0
Njeri Kamau,17768380,0741398852,2024-12,500,0
Njeri Nyambura,30123800,0774976843,2024-12,500,0
Njeri Nyambura,39794385,0730491798,2024-12,3000,0
Otieno Kiprop,19429642,0711187153,2024-12,1000,0
Otieno Wafula,37633503,0730540981,2024-12,500,0
Quincy Wafula,20208353,0716967656,2024-12,1500,2500
Tabitha Wafula,10515179,0719380507,2024-12,1000,0
Umi Odhiambo,25199759,0761520151,2024-12,1000,0
victor otieno,26360430,0748849399,2024-12,1500,0
victor wafula,32157701,0764973958,2024-12,2000,0
Victor Wanjiku,21155946,0713720959,2024-12,1500,0
Wanjiru Mutua,13515343,0771133225,2024-12,2000,1000
Wanjiru Wafula,19149006,0792961750,2024-12,2000,0
Yusuf Njoroge,39988616,0720214280,2024-12,2000,2500
zawadi kamau,16188522,0714830077,2024-12,500,1000
Zawadi Kiprop,,0766196243,2024-12,2000,0
Zawadi Mutua,14505010,0780683634,2024-12,500,1000
Zawadi Wafula,16448320,0771237141,2024-12,500,0
`;
