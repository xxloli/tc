

// x.com/?action=sjst
//x.com/?cors=


// 使用ES模块导出接口
export default {
  async fetch(request, env) { // 添加env参数以访问D1绑定
    const url = new URL(request.url);
    const { searchParams } = url;

    if (request.method === 'GET' && url.pathname === '/img') {
      return await xjjimg(env.img_xjj);
    }
    if (request.method === 'GET' && url.pathname === '/mp4') {
      return await xjjmp4(env.img_xjj);
    }

 
    
    // 处理POST请求 - 存储图片链接到D1
    if (request.method === 'POST' && url.pathname === '/img_xjj') {
      return await storeImageUrls(request,env.img_xjj);
    }

    const clyl = searchParams.get('clyl');
    if (clyl) {
      return await clylapi(clyl);
    }

    // 处理 url 参数，进行 CORS 代理
    const targetUrl = searchParams.get('cors');
    if (targetUrl) {
      return await proxyRequest(targetUrl);
    }

    const targetUrl21 = searchParams.get('1');
    if (targetUrl21) {
      return await douyinjiexi(targetUrl21,env.bcdysp);
    }

    const targetUrl2 = searchParams.get('dyjx');
    if (targetUrl2) {
      return await douyinjiexi2(targetUrl2,env.bcdysp);
     // return await juhejiexi(targetUrl2);
    }

    const targetUrl3 = searchParams.get('dyzbjx');
    if (targetUrl3) {
      return await douyinzhibojiexi(targetUrl3);
    }
    const targetUrl4 = searchParams.get('tiktokjx');
    if (targetUrl4) {
      return await tiktokjiexi(targetUrl4);
    }

    const targetUrl5 = searchParams.get('ksjx');
    if (targetUrl5) {
      return await kuaishoujiexi2(targetUrl5);
    }
    const targetUrl6 = searchParams.get('kszbjx');
    if (targetUrl6) {
      return await kuaishouzhibojiexi(targetUrl6);
    }
    const targetUrl7 = searchParams.get('tiktokzbjx');
    if (targetUrl7) {
      return await tiktokzhibojiexi(targetUrl7);
    }

    // 默认返回空响应
    return defaultResponse();
  }
};



//抖音解析功能 
async function douyinjiexi(targetUrl2,bcdysp) {
  try {
    const decodedUrl = decodeURIComponent(targetUrl2);
    if (decodedUrl === "") return errorResponse("解析失败,无效的URL");
    
    // 提取URL
    const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return errorResponse("解析失败,无效的URL");
    
    const url = urlMatch[0];
    
    // 使用api.py中的抖音解析逻辑
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
      "Cookie": "ttwid=1%7CdjUiwt-8iojVf89TbwdaPcsDLpn1fU00mKYaYCBRiHg%7C1710746734%7Ccd7960b547be86bd14c56832ffea3ec035af1704696960274f2ba4017cb0c420; bd_ticket_guard_client_web_domain=2; xgplayer_user_id=300976970825; odin_tt=cd1484c33777a5b6033eb2d704acf1325c6fa8f87f298761b34d502b2bc72e0e063bb76cafae6eda77504b92388a945495fa1bee99afaece54fadb48bd1e2eef65754e14fcd52875cf4e859f9f2797a1; xgplayer_device_id=33693820609; SEARCH_RESULT_LIST_TYPE=%22single%22; s_v_web_id=verify_lwllt9d5_131z6m2c_JOGv_4TDi_Aoje_kOMojbHCPw0e; passport_csrf_token=acfb568a5e849c00aae32c504ddcf720; passport_csrf_token_default=acfb568a5e849c00aae32c504ddcf720; UIFID_TEMP=c4683e1a43ffa6bc6852097c712d14b81f04bc9b5ca6d30214b0e66b4e3852802afe10dc759a4840b81140431eb63f5b7b9bf48388d5b2ea51d2c5499bf93eed4f464fc4a76e1d4f480f11523a92ed21; FORCE_LOGIN=%7B%22videoConsumedRemainSeconds%22%3A180%7D; fpk1=U2FsdGVkX1+zE2LbMIyeNz1bUAgXGI+GV9C9WyJchdXBQ+btbZOeBnttBI4FeWUjU8NDIweP6c2iFxNRAl9NzA==; fpk2=5f4591689f71924dbd1e95e47aec4ed7; UIFID=c4683e1a43ffa6bc6852097c712d14b81f04bc9b5ca6d30214b0e66b4e3852802afe10dc759a4840b81140431eb63f5b25c36f37f88bb35edf57e7b457b5f0552d48a4805370c354b88614ee3785e7a8d8360ba6238aea0fe85f7065584d0a57c40df70e202458dc7c81352a7d3040448ff6ed7106b36bc97733c48387da93953c97d5d7d7e128afc2d0497e2a51e4da5cae0c627ce32ce055c1b4e50a7c6b2f; vdg_s=1; pwa2=%220%7C0%7C3%7C0%22; download_guide=%223%2F20240702%2F1%22; douyin.com; device_web_cpu_core=12; device_web_memory_size=8; architecture=amd64; strategyABtestKey=%221719937555.264%22; csrf_session_id=6a4f4bf33581bf51380386b4904f13f7; __live_version__=%221.1.2.1533%22; live_use_vvc=%22false%22; webcast_leading_last_show_time=1719937582984; webcast_leading_total_show_times=1; webcast_local_quality=sd; xg_device_score=7.666140284295324; dy_swidth=1920; dy_sheight=1080; stream_recommend_feed_params=%22%7B%5C%22cookie_enabled%5C%22%3Atrue%2C%5C%22screen_width%5C%22%3A1920%2C%5C%22screen_height%5C%22%3A1080%2C%5C%22browser_online%5C%22%3Atrue"
    };

    // 获取重定向信息
    const response = await fetch(url, { 
      headers: headers, 
      redirect: 'manual'
    });
    
    let redirectUrl = url;
    if (response.status >= 300 && response.status < 400) {
      redirectUrl = response.headers.get('Location');
    }
    
    // 从重定向URL中提取item_text
    const itemTextMatch = redirectUrl.match(/\/(\w+)\/?\?/);
    let itemText = itemTextMatch ? itemTextMatch[1] : '';
    
    // 如果没有找到，直接从原URL中提取
    if (!itemText) {
      const originalMatch = url.match(/\/(\w+)\/?\?/);
      itemText = originalMatch ? originalMatch[1] : '';
    }
    
    if (!itemText) {
      return errorResponse("无法提取视频ID");
    }

    // 提取数字部分作为video_id
    const numbers = itemText.match(/\d+/g);
    const video_id = numbers ? numbers.join('') : '';
    
    if (!video_id) {
      return errorResponse("无法提取视频ID");
    }

    // 获取详细信息
    const detailUrl = `https://www.douyin.com/user/self?modal_id=${video_id}&showTab=like`;
    const detailResponse = await fetch(detailUrl, { 
      headers: headers, 
      redirect: 'follow'
    });
    
    const html = await detailResponse.text();
    
    // 提取JSON数据
    const startStr = '<script id="RENDER_DATA" type="application/json">';
    const endStr = '</script>';
    
    if (!html.includes(startStr)) {
      return errorResponse("无法找到数据:"+html);
    }
    
    const jsonStr = html.split(startStr)[1].split(endStr)[0];
    const decodedJsonStr = decodeURIComponent(jsonStr);
    const data = JSON.parse(decodedJsonStr);
    
    // 处理结果
    const media_type = data.app.videoDetail.mediaType;
    let video_desc = data.app.videoDetail.desc;
    // 处理换行符
    video_desc = video_desc.replace(/\r?\n/g, '\n');
    
    const author_info = {
      nickname: data.app.videoDetail.authorInfo.nickname,
      avatar: data.app.videoDetail.authorInfo.avatarThumb || ''
    };
    
    const cover_url = data.app.videoDetail.coverUrl || '';
    
    let videoUrl = null;
    let images = [];
    let type = 'video';
    
    if (media_type === 4) { // 视频
      let playApi = data.app.videoDetail.video.playApi;
      playApi = playApi.split('&aid')[0];
      
      // 获取重定向后的视频URL
      const redirectResp = await fetch(playApi, { 
        headers: headers, 
        redirect: 'manual'
      });
      
      let location = redirectResp.headers.get("Location");
      if (location) {
        videoUrl = location.split('&btag')[0];
      }
      
      type = 'video';
      

    } 
    else if (media_type === 2) { // 图片
      images = data.app.videoDetail.images.map(img => ({
        url_list: [img.urlList[0]]
      }));
      type = 'image';
    }
    else if (media_type === 42) { // 混合内容
      images = data.app.videoDetail.images.map(img => {
        const videoInfo = img.video;
        if (videoInfo) {
          return {
            url_list: [videoInfo.playApi.split('&aid')[0]]
          };
        } else {
          return {
            url_list: [img.urlList[0]]
          };
        }
      });
      type = 'image';
    }
    else {
      return errorResponse(`未知的媒体类型: ${media_type}`);
    }
    
    // 图片处理
    const processedImages = images.map(img => {
      return (img.url_list?.[0] + "&.png" || '');
    });
    
    // 构建输出结构
    const output = {
      msg: videoUrl || processedImages.length > 0 ? '解析成功！💬️' : '解析失败！💦',
      name: author_info.nickname,
      title: video_desc,
      aweme_id: video_id, 
      video: videoUrl || '',
      cover: cover_url,
      images: processedImages,
      type: type,
      tips: '推荐！柯艺云图床 https://tc.qdqqd.com/'
    };

    return new Response(JSON.stringify(output, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return errorResponse(`抖音解析失败: ${error.message}`);
  }
}

// 备份原来的抖音解析功能 
async function douyinjiexi_backup(targetUrl2,bcdysp) {
  try {

    let video_id;
    const decodedUrl = decodeURIComponent(targetUrl2);
    if (decodedUrl==="") return errorResponse("解析失败,无效的URL");
    // 判断是否为数字
    if (/^\d+$/.test(decodedUrl)) {
      video_id = decodedUrl;
    } else {
      // 提取URL
      const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) return errorResponse("解析失败,无效的URL");
      
      // 获取重定向URL（修复相对路径问题）
      const redirectedUrl = await getRedirectedUrl(urlMatch[0]);
      const idMatch = redirectedUrl.match(/(\d+)/);
      if (!idMatch) return errorResponse("解析失败,无法提取视频ID");
      video_id = idMatch[1];
    }


    const response = await fetch(`https://www.iesdouyin.com/share/video/${video_id}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'Referer': 'https://www.douyin.com/?is_from_mobile_home=1&recommend=1',
       
      }
    });

    const html = await response.text();
  // 正则匹配_ROUTER_DATA（严格还原PHP匹配逻辑）
  const routerDataMatch = html.match(/_ROUTER_DATA\s*=\s*(\{[\s\S]*?\});/);
  if (!routerDataMatch || !routerDataMatch[1]) {
    return errorResponse("解析失败,即将进行抖音解析算法升级,等待恢复");
  }

  // 严格JSON解析（保留PHP的宽松解析特性）
  let jsonData;
  try {
    jsonData = JSON.parse(routerDataMatch[1].replace(/\\x([0-9A-F]{2})/gi, (match, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
    }));
  } catch (e) {
    return errorResponse("JSON解析失败: " + e.message);
  }

  // 精准还原PHP的数据访问路径
  const loaderData = jsonData.loaderData;
  if (!loaderData) return errorResponse("解析失败,无效的loaderData");

  const videoPageKey = Object.keys(loaderData).find(k => k.startsWith('video_') && k.endsWith('/page'));
  if (!videoPageKey) return errorResponse("解析失败,无效的videoPageKey");

  const videoInfoRes = loaderData[videoPageKey]?.videoInfoRes;
  if (!videoInfoRes) return errorResponse("解析失败,无效的videoInfoRes");

  const itemList = videoInfoRes.item_list?.[0];
  if (!itemList) return errorResponse("解析失败,无效的itemList");

  // 逐字段严格映射
  const nickname = itemList.author?.nickname || '';
  const title = itemList.desc || '';
  const awemeId = itemList.aweme_id || '';
  const videoUri = itemList.video?.play_addr?.uri || '';
  const coverList = itemList.video?.cover?.url_list || [];
  const images = itemList.images || [];

  // 视频URL生成逻辑（完全还原PHP判断）
  let videoUrl = null;
  if (videoUri) {
    videoUrl = (videoUri.includes('mp3') || videoUri.includes('m4a') || videoUri.includes('douyinstatic.com')) 
      ? '' 
      : `https://www.douyin.com/aweme/v1/play/?video_id=${videoUri}&ratio=1080p&.mp4`;
  
    // 新增数据库插入操作，仅在 videoUrl 不为空时执行
    if (videoUrl) {
      await bcdysp.prepare('INSERT INTO media (key, timestamp, url) VALUES (?, ?, ?) ON CONFLICT(key) DO NOTHING')
        .bind(videoUri, Date.now(), videoUrl)
        .run();
    }
  }
  

  // 封面图选择逻辑
  const cover = coverList[0] || '';

  // 图片处理（保留PHP的array_map逻辑）
  const processedImages = images.map(img => {
    return (img.url_list?.[0] + "&.png" || '');
  });

  // 构建完全一致的输出结构
  const output = {
    msg: videoUrl ? '解析成功！💬️' : '解析失败！💦',
    name: nickname,
    title: title,
    aweme_id: awemeId, 
    video: videoUrl,
    cover: cover,
    images: processedImages,
    type: images.length ? 'image' : 'video',
    tips: '推荐！柯艺云图床 https://tc.qdqqd.com/'
  };

    return new Response(JSON.stringify(output, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return errorResponse(`服务器错误: ${error.message}`);
  }
  }


//抖音解析功能  备用1
async function douyinjiexi1(targetUrl2,_bcdysp) {
    try {
  
      const decodedUrl = decodeURIComponent(targetUrl2);
      if (decodedUrl==="") return errorResponse("解析失败,无效的URL");
      const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) return errorResponse("解析失败,无效的URL");
      const douyinUrl = `https://douyin.wtf/api/hybrid/video_data?minimal=true&url=${urlMatch[0]}`;
      const response = await fetch(douyinUrl);
      const html = await response.text();
      const jsonData = JSON.parse(html);

    // 逐字段严格映射
    const nickname = jsonData.data.author?.nickname || '';

    if(!nickname) return await juhejiexi(targetUrl2);
    const title = jsonData.data?.desc || '';
    const awemeId = jsonData.data?.aweme_id || '';
    const videoUri = jsonData.data.video_data?.nwm_video_url || '';
    const cover = jsonData.data.cover_data.origin_cover?.url_list[0] || '';
    const images = jsonData.data.image_data?.no_watermark_image_list || [];
    if (videoUri) {
      await _bcdysp.prepare('INSERT INTO media (key, timestamp, url, md5 , ip) VALUES (?, ?, ?, ?, ?) ON CONFLICT(key) DO NOTHING').bind(awemeId, Date.now(), videoUri, awemeId, 'dyjx').run();
    }
    // 图片处理（保留PHP的array_map逻辑）
    const processedImages = images.map(img => {
      return img + "&.png" || '';
    });
  
    // 构建完全一致的输出结构
    const output = {
      msg: nickname ? '解析成功！💬️' : '解析失败！💦',
      name: nickname,
      title: title,
      aweme_id: awemeId, 
      video: videoUri,
      cover: cover,
      images: processedImages,
      back:'第三方备份',
      type: videoUri ? 'video' : 'image',
      tips: '推荐！柯艺云图床 https://tc.qdqqd.com/'
    };
  
      return new Response(JSON.stringify(output, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
  
    } catch (error) {
      return errorResponse(`服务器错误: ${error.message}`);
    }
    }  

// 新野api 解析 抖音
async function douyinjiexi2(targetUrl2,_bcdysp) {
  try {

    const decodedUrl = decodeURIComponent(targetUrl2);
    if (decodedUrl==="") return errorResponse("解析失败,无效的URL");

      // 提取URL
      const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) return errorResponse("解析失败,无效的URL");
  
      const douyinUrl = `https://api.suxun.site/api/juhe?url=${urlMatch[0]}`;
      const response = await fetch(douyinUrl, {
        method: 'GET',
      });
    const html = await response.text();
    const jsonData = JSON.parse(html);


  const nickname = jsonData.data?.author || '';
  if(!nickname) return await douyinjiexi3(targetUrl2,_bcdysp);
  const title = jsonData.data?.title || '';
  const awemeId = jsonData.data?.url || '';
  const videoUri = jsonData.data?.url || '';

  const cover = jsonData.data?.cover || '';
  const images = jsonData.data?.images || [];


  let type;
  if (images.length === 0) {
      type = 'video';
  } else {
      type = 'image';
  }

  // 图片处理（保留PHP的array_map逻辑）
  const processedImages = images.map(img => {
    return img + "&.png" || '';
  });






  // 构建完全一致的输出结构
  const output = {
    msg: cover ? '解析成功！💬️' : '解析失败！💦',
    name: nickname,
    title: title,
    aweme_id: awemeId, 
    video: videoUri,
    cover: cover,
    images: processedImages,
    back:'第三方接口',
    type: type,
    tips: '推荐！柯艺云图床 https://tc.qdqqd.com/'
  };

    return new Response(JSON.stringify(output, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return errorResponse(`服务器错误: ${error.message}`);
  }
  }

  // pearapi 解析 抖音
async function douyinjiexi3(targetUrl2,_bcdysp) {
  try {

    const decodedUrl = decodeURIComponent(targetUrl2);
    if (decodedUrl==="") return errorResponse("解析失败,无效的URL");

      // 提取URL
      const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) return errorResponse("解析失败,无效的URL");
  
      const douyinUrl = `https://api.pearktrue.cn/api/video/douyin/?url=${urlMatch[0]}`;
      const response = await fetch(douyinUrl, {
        method: 'GET',
      });
    const html = await response.text();
    const jsonData = JSON.parse(html);


  const nickname = jsonData.data?.author || '';
  if(!nickname) return await douyinjiexi1(targetUrl2,_bcdysp);
  const title = jsonData.data?.title || '';
  const awemeId = jsonData.data?.url || '';
  const videoUri = jsonData.data?.url || '';
  const cover = jsonData.data?.cover || '';
  const images = jsonData.data?.images || [];


  let type;
  if (images.length === 0) {
      type = 'video';
  } else {
      type = 'image';
  }

  // 图片处理（保留PHP的array_map逻辑）
  const processedImages = images.map(img => {
    return img + "&.png" || '';
  });






  // 构建完全一致的输出结构
  const output = {
    msg: cover ? '解析成功！💬️' : '解析失败！💦',
    name: nickname,
    title: title,
    aweme_id: awemeId, 
    video: videoUri,
    cover: cover,
    images: processedImages,
    back:'第三方接口',
    type: type,
    tips: '推荐！柯艺云图床 https://tc.qdqqd.com/'
  };

    return new Response(JSON.stringify(output, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return errorResponse(`服务器错误: ${error.message}`);
  }
  }

//抖音直播解析  
async function douyinzhibojiexi(targetUrl3) {
  try {
    const decodedUrl = decodeURIComponent(targetUrl3);
    if (decodedUrl==="") return errorResponse("解析失败,无效的URL");
    let video_id;
    const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return errorResponse("解析失败,无效的URL");
    video_id = urlMatch[0];
    // 初始化请求
    let response;
    //获取重定向后的最终链接
    let redirectUrl =  await getRedirectedUrl(video_id);


    // 只取问号前面的部分
    redirectUrl = redirectUrl.split('?')[0];

    // 发起新的请求
    if (redirectUrl.includes('live')){
    response = await fetch(redirectUrl, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
        'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'Cookie': '__ac_nonce=067be741800563504ec19; __ac_signature=_02B4Z6wo00f014aZQOAAAIDC3WRFVo.CNqeGuURAAIYg62',
        'user-agent': 'Mozilla/5.0 (Linux; Android 14; 21121210C Build/UKQ1.230917.001) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36'
      }
    });
  } else {
    response = await fetch(redirectUrl, {
      headers: {
        'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
        'sec-ch-ua': '"Google Chrome";v="89", "Chromium";v="89", ";Not A Brand";v="99"',
        'sec-ch-ua-mobile': '?0',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'none',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36'
      }
    });

  }
    const html = await response.text();

    // 转义整个网页内容
    const unescapedHtml = html.replace(/\\u0026/g, '&').replace(/\\n/g, '#@#').replace(/\\/g, '').replace(/#@#/g, '\n');



    const flvRegex = /https?:\/\/[^\"\'\s>]+\.flv[^\s\'\">]*/gi;
    const matches = unescapedHtml.match(flvRegex);
    const m3u8Regex = /https?:\/\/[^\"\'\s>]+\.m3u8[^\s\'\">]*/gi;
    const matches2 = unescapedHtml.match(m3u8Regex);

// 提取 nickname
const nicknameRegex = /"nickname"\s*:\s*"([^"]+)"/;
const nicknameMatch = unescapedHtml.match(nicknameRegex);
const nickname = nicknameMatch ? nicknameMatch[1] : '';

// 提取 signature
const signatureRegex = /"signature"\s*:\s*"((?:\\"|[^"])+)"/;
const signatureMatch = unescapedHtml.match(signatureRegex);
const signature = signatureMatch ? signatureMatch[1] : '';
// 提取 粉丝数
const followerCountRegex = /"followerCount":(\d+)/;
const followerCountMatch = unescapedHtml.match(followerCountRegex);
const followerCount = followerCountMatch ? followerCountMatch[1] : '';
// 提取 关注数
const followingCountRegex = /"followingCount":(\d+)/;
const followingCountMatch = unescapedHtml.match(followingCountRegex);
const followingCount = followingCountMatch ? followingCountMatch[1] : '';

    if (!matches || matches.length === 0) {
      return errorResponse("解析失败,未获取到flv链接");
    }
    const secureMatches = matches.map(url => url.replace(/^http:\/\//, 'https://'));
    const secureMatches2 = matches2.map(url => url.replace(/^http:\/\//, 'https://'));
    // 分类 URL
    const result = {
      msg: nickname ? '解析成功！💬️' : '解析失败！💦',
      SD: "",
      LD: "",
      HD: "",
      OR4: "",
      m3u8_SD: "",
      m3u8_LD: "",
      m3u8_HD: "",
      m3u8_OR4: "",
      nickname:nickname,
      signature:signature,
      zburl:redirectUrl,
      followerCount:followerCount,
      followingCount:followingCount,
    };

    secureMatches.forEach(url => {
      if (url.includes('sd')) {
        result.SD = url;
      } else if (url.includes('ld')) {
        result.LD = url;
      } else if (url.includes('hd')) {
        result.HD = url;
      } else if (url.includes('or4')) {
        result.OR4 = url;
      }
    });
    secureMatches2.forEach(url => {
      if (url.includes('sd')) {
        result.m3u8_SD = url;
      } else if (url.includes('ld')) {
        result.m3u8_LD = url;
      } else if (url.includes('hd')) {
        result.m3u8_HD = url;
      } else if (url.includes('or4')) {
        result.m3u8_OR4 = url;
      }
    });
    // 返回分类后的URL
    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return errorResponse(`服务器错误: ${error.message}`);
  }
}

//快手解析功能 
async function kuaishoujiexi(targetUrl5, bcdysp) {
  const decodedUrl = decodeURIComponent(targetUrl5);
  if (decodedUrl==="") return errorResponse("解析失败,无效的URL");
    const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);

  const result = {
    msg: '解析失败！💦',
    name: '',
    title: '',
    video: '',
    cover: '',
    images: [],
    type: '',
    tips: '推荐！柯艺云图床 tc.qdqqd.com'
  };

  try {
    // ================= 阶段一：智能重定向处理 =================
    let currentUrl = urlMatch[0];
        //获取重定向后的最终链接
        currentUrl =  await getRedirectedUrl(currentUrl);

    // ================= 阶段二：内容获取与预处理 =================
    const htmlRes = await fetch(currentUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.95 Safari/537.36' }
    });
    let html = await htmlRes.text();
    html = html.replace(/\\u002F/g, '/');

    // ================= 阶段三：核心数据提取 =================
    const isAtlas = html.includes("HORIZONTAL_ATLAS") || html.includes("VERTICAL_ATLAS");
    const nameRegex = isAtlas ? /"userName":"([^"]+)"/ : /"name":"([^"]+)"/;
    result.name = (html.match(nameRegex) || [])[1] || '';
    result.title = (html.match(/"caption":"([^"]+)"/) || [])[1] || '';
    result.msg = result.title ? '解析成功！💬️' : result.msg;
    result.type = isAtlas ? 'image' : 'video';

    // ================= 阶段四：媒体资源处理 =================
    if (isAtlas) {
      const imgMatches = html.match(/ufile\/atlas\/[^"]+\.jpg/g) || [];
      result.images = imgMatches.length ? 
        imgMatches.map(m => `https://qdqqd.a.yximgs.com/${m}`) : 
        null;
    } else {
  const videoMatch = html.match(/null,"url"\s*:\s*"([^"]+)&tag/is);
  const coverMatch = html.match(/"coverUrl"\s*:\s*"([^"]{10,})"/is);
  result.video = videoMatch?.[1].replace(/\\\//g, '/') ? videoMatch?.[1].replace(/\\\//g, '/')+"&.mp4"  : '';
  result.cover = coverMatch?.[1].replace(/\\u002F/g, '/') ? coverMatch?.[1].replace(/\\u002F/g, '/')+"&.jpg" : '';

    }



  } catch (error) {
    console.error(`[解析错误] ${error.message}`);
  } finally {
    // 最终数据清洗
    Object.keys(result).forEach(k => {
      if (result[k] === undefined || (Array.isArray(result[k]) && !result[k].length)) {
        result[k] = null;
      }
    });
  }

  return new Response(
    JSON.stringify(result, null, 2),
    { headers: { 
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*' 
    }}
  );
}

async function kuaishoujiexi2(targetUrl5) {
  try {

    const decodedUrl = decodeURIComponent(targetUrl5);
    if (decodedUrl==="") return errorResponse("解析失败,无效的URL");

      // 提取URL
      const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) return errorResponse("解析失败,无效的URL");
  
      const douyinUrl = `https://api.suxun.site/api/juhe?url=${urlMatch[0]}`;
      const response = await fetch(douyinUrl, {
        method: 'GET',
      });
    const html = await response.text();
    const jsonData = JSON.parse(html);


  const nickname = jsonData.data?.author || '';
  const title = jsonData.data?.title || '';
  const videoUri = jsonData.data?.url || '';
  const cover = jsonData.data?.cover || '';
  const images = jsonData.data?.images || [];


  let type;
  if (images.length === 0) {
      type = 'video';
  } else {
      type = 'image';
  }

  // 图片处理（保留PHP的array_map逻辑）
  const processedImages = images.map(img => {
    return img || '';
  });






  // 构建完全一致的输出结构
  const output = {
    msg: cover ? '解析成功！💬️' : '解析失败！💦',
    name: nickname,
    title: title,
    video: videoUri,
    cover: cover,
    images: processedImages,
    back:'第三方接口',
    type: type,
    tips: '推荐！柯艺云图床 https://tc.qdqqd.com/'
  };

    return new Response(JSON.stringify(output, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return errorResponse(`服务器错误: ${error.message}`);
  }
  }


//快手直播解析 
async function kuaishouzhibojiexi(targetUrl6) {
  try {
    const decodedUrl = decodeURIComponent(targetUrl6);
    if (decodedUrl==="") return errorResponse("解析失败,无效的URL");
    let video_id;
    const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return errorResponse("解析失败,无效的URL");
    video_id = urlMatch[0];
    // 初始化请求
if (!video_id.includes('live.')){
  let response = await fetch(video_id, {
    redirect: 'manual', // 禁止自动跟随重定向
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36'
    }
  });

// 获取重定向URL
let redirectUrl = response.headers.get('Location');
// 只取这部分：3x3d8xgksubhes2
let path = redirectUrl.split('?')[0]; // 获取 ? 之前的部分
let videoId = path.split('/').pop(); // 获取路径的最后一部分
video_id = "https://live.kuaishou.com/live_api/liveroom/livedetail?principalId=" + videoId;

} else {
  let path = video_id.split('?')[0]; // 获取 ? 之前的部分
  let videoId = path.split('/').pop(); // 获取路径的最后一部分
  video_id = "https://live.kuaishou.com/live_api/liveroom/livedetail?principalId=" + videoId;

}



let response1 = await fetch(video_id, {
      headers: {
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36'
      }
    });

  
    const html = await response1.text();
    const jsonData = JSON.parse(html);

    const representations = jsonData.data.liveStream?.playUrls?.h264?.adaptationSet?.representation || [];

    let sdvideo = null;
    let ldvideo = null;
    let hdvideo = null;
    let or4video = null;
    let m3u8video = null;
    
    representations.forEach(rep => {
      switch (rep.qualityType) {
        case "STANDARD":
          sdvideo = rep.url;
          break;
        case "HIGH":
          ldvideo = rep.url;
          break;
        case "SUPER":
          hdvideo = rep.url;
          break;
        case "BLUE_RAY":
          or4video = rep.url;
          break;
        default:
          break;
      }
    });
    // 提取 nickname
    const nickname = jsonData.data?.author?.name || null;
    
    // 提取 signature
    const signature = jsonData.data?.author?.description || null;
    
    // 提取 粉丝数
    const followerCount = jsonData.data?.author?.counts?.fan || null;
    
    // 提取 关注数
    const followingCount = jsonData.data?.author?.counts?.follow || null;
    
    const zburl = jsonData.data?.liveStream?.url || null;
    m3u8video = jsonData.data.liveStream?.hlsPlayUrl || null;
    if (!nickname) {
      return errorResponse("解析失败,未获取到flv链接");
    }
    // 分类 URL
    const result = {
      msg: nickname ? '解析成功！💬️' : '解析失败！💦',
      SD: sdvideo,
      LD: ldvideo,
      HD: hdvideo,
      OR4: or4video,
      M3U8video:m3u8video,
      nickname:nickname,
      signature:signature,
      zburl:zburl,
      followerCount:followerCount,
      followingCount:followingCount,
    };

    // 返回分类后的URL
    return new Response(JSON.stringify(result, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return errorResponse(`服务器错误: ${error.message}`);
  }
}

//tiktok解析功能 
async function tiktokjiexi(targetUrl4,bcdysp) {
  try {
    const decodedUrl = decodeURIComponent(targetUrl4);
    if (decodedUrl === "") return errorResponse("解析失败,无效的URL");
    
    const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);
    if (!urlMatch) return errorResponse("解析失败,无效的URL");
    
    // 修复：获取实际URL字符串
    let videoUrl = urlMatch[0];
    
    // 处理短链接重定向
    if (videoUrl.includes('/t/')) {
      videoUrl = await getRedirectedUrl(videoUrl);
    }
    
    // 统一请求头
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.72 Safari/537.36'
    };
    
    // 判断内容类型
    const tiktoktype = videoUrl.includes('/video/') ? 'video' : 'image';
    const response = await fetch(`https://douyin.wtf/api/hybrid/video_data?url=${videoUrl}&minimal=true`, { headers });

    const html = await response.text();
   const jsonData = JSON.parse(html);
 

  // 逐字段严格映射
  const nickname = jsonData.data.author?.nickname || '';
  const title = jsonData.data?.desc || '';
  const awemeId = jsonData.data?.aweme_id || '';
  const videoUri = jsonData.data.video_data?.nwm_video_url_HQ ? jsonData.data.video_data.nwm_video_url_HQ+"&.mp4"  : '';
  const coverList = jsonData.data.cover_data?.origin_cover.url_list[1] ? jsonData.data.cover_data.origin_cover.url_list[1]+"&.jpg" : '';

  const images = Array.isArray(jsonData?.data?.image_data?.no_watermark_image_list) 
  ? jsonData.data.image_data.no_watermark_image_list
  : [];


  // 图片处理（保留PHP的array_map逻辑）
  const processedImages = images.map(img => {
    return (img + "&.jpeg" || '');
  });

  // 构建完全一致的输出结构
  const output = {
    msg: nickname ? '解析成功！💬️' : '解析失败！💦',
    name: nickname,
    title: title,
    aweme_id: awemeId, 
    video: videoUri,
    cover: coverList,
    images: processedImages,
    type: tiktoktype,
    tips: '推荐！柯艺云图床 https://tc.qdqqd.com/'
  };

    return new Response(JSON.stringify(output, null, 2), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });

  } catch (error) {
    return errorResponse(`服务器错误: ${error.message}`);
  }
  }

  //tiktok直播解析 
  async function tiktokzhibojiexi(targetUrl7) {
    try {
      const decodedUrl = decodeURIComponent(targetUrl7);
      if (decodedUrl === "") return errorResponse("解析失败,无效的URL");
      
      const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);
      if (!urlMatch) return errorResponse("解析失败,无效的URL");
      
      // 修复：获取实际URL字符串
      let videoUrl = urlMatch[0];
      
      // 处理短链接重定向
      if (videoUrl.includes('vm.tiktok')) {
        videoUrl = await getRedirectedUrl(videoUrl);
      }
      if (!videoUrl.includes('live')) {
        return errorResponse("解析失败,无效的URL");
      }
      // 统一请求头
      const headers = {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 8.0.0; SM-G955U Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36'
      };
      let path = videoUrl.split('?')[0]; 
      const response = await fetch(path, { headers });
  
      const html = await response.text();
  
      // 转义整个网页内容
      const unescapedHtml = html.replace(/\\u0026/g, '&').replace(/\\u002F/g, '/').replace(/\\n/g, '#@#').replace(/\\/g, '').replace(/#@#/g, '\n');
  
  
  
      const flvRegex = /https?:\/\/[^\"\'\s>]+\.flv[^\s\'\">]*/gi;
      const matches = unescapedHtml.match(flvRegex);
      const m3u8Regex = /https?:\/\/[^\"\'\s>]+\.m3u8[^\s\'\">]*/gi;
      const matches2 = unescapedHtml.match(m3u8Regex);

  // 提取 nickname
  const nicknameRegex = /"nickname"\s*:\s*"([^"]+)","secUid/;
  const nicknameMatch = unescapedHtml.match(nicknameRegex);
  const nickname = nicknameMatch ? nicknameMatch[1] : null;
  
  // 提取 signature
  const signatureRegex = /"title"\s*:\s*"((?:\\"|[^"])+)","startTime/;
  const signatureMatch = unescapedHtml.match(signatureRegex);
  const signature = signatureMatch ? signatureMatch[1] : null;
  // 提取 粉丝数
  const followerCountRegex = /"followerCount":(\d+)/;
  const followerCountMatch = unescapedHtml.match(followerCountRegex);
  const followerCount = followerCountMatch ? followerCountMatch[1] : null;
  // 提取 关注数
  const followingCountRegex = /"followingCount":(\d+)/;
  const followingCountMatch = unescapedHtml.match(followingCountRegex);
  const followingCount = followingCountMatch ? followingCountMatch[1] : null;
  
      if (!matches || matches.length === 0) {
        return errorResponse("解析失败,未获取到flv链接");
      }

      // 分类 URL
      const result = {
        msg: nickname ? '解析成功！💬️' : '解析失败！💦',
        SD: "",
        LD: "",
        HD: "",
        OR4: "",
        m3u8_SD: "",
        m3u8_LD: "",
        m3u8_HD: "",
        m3u8_OR4: "",
        nickname:nickname,
        signature:signature,
        zburl:path,
        followerCount:followerCount,
        followingCount:followingCount,
      };
  
      matches.forEach(url => {
        if (url.includes('or4')) {
          result.OR4 = url;
        } else if (url.includes('uhd60')||url.includes('uhd560')) {
          result.HD = url;
        } else if (url.includes('hd60')||url.includes('hd560')) {
          result.SD = url;
        } else if (url.includes('hd')||url.includes('hd5')) {
          result.LD = url;
        }
      });
      matches2.forEach(url => {
        if (url.includes('or4')) {
          result.m3u8_OR4 = url;
        } else if (url.includes('hd')) {
          result.m3u8_HD = url;
        } else if (url.includes('sd')) {
          result.m3u8_SD = url;
        } else if (url.includes('ld')) {
          result.m3u8_LD = url;
        }
      });
      // 返回分类后的URL
      return new Response(JSON.stringify(result, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
  
    } catch (error) {
      return errorResponse(`服务器错误: ${error.message}`);
    }
  }

// 聚合解析
  async function juhejiexi(targetUrl2) {
    try {
  
      const decodedUrl = decodeURIComponent(targetUrl2);
      if (decodedUrl==="") return errorResponse("解析失败,无效的URL");

        // 提取URL
        const urlMatch = decodedUrl.match(/https?:\/\/[^\s]+/);
        if (!urlMatch) return errorResponse("解析失败,无效的URL");
    
        const douyinUrl = `https://dt.bd.cn/api/ai_mark/remove?_t=1756109054288`;
        const response = await fetch(douyinUrl, {
          method: 'POST',
          headers: {
            'authorization': 'Bearer eyJkYXRhIjp7InVpZCI6IjE1Nzc0NTMxIiwibHgiOjF9LCJleHAiOjE3NTY5NzMwMzIsImlhdCI6MTc1NjEwOTAzMiwidG9wX3VpZCI6IjE0NzU4Njc5IiwibGV2ZWwiOiIyIiwiY3JlYXRlZF9hdCI6IjE3NTIwNjY0NTYifQ.H6NTj0APmDYzT1163BcSmYCHMWhMnxqJ4BQHP1EcEzw',
            'content-type': 'application/x-www-form-urlencoded'
          },
          body: `url=${encodeURIComponent(urlMatch[0])}`
        });
      const html = await response.text();
      const jsonData = JSON.parse(html);
  

    const nickname = jsonData.data?.title || '';
    const title = jsonData.data?.title || '';
    const awemeId = jsonData.data?.code || '';
    const videoUri = jsonData.data?.url || '';
    let videoUri2;
    const cover = jsonData.data?.img || '';
    const images = jsonData.data?.pics || [];
    if (videoUri) {
      videoUri2 = videoUri+"&.mp4"; 
    }
    // 图片处理（保留PHP的array_map逻辑）
    const processedImages = images.map(img => {
      return img + "&.png" || '';
    });
  
  
  
  
  
  
    // 构建完全一致的输出结构
    const output = {
      msg: cover ? '解析成功！💬️' : '解析失败！💦',
      name: nickname,
      title: title,
      aweme_id: awemeId, 
      video: videoUri2,
      cover: cover,
      images: processedImages,
      back:'第三方接口',
      type: videoUri ? 'video' : 'image',
      tips: '推荐！柯艺云图床 https://tc.qdqqd.com/'
    };
  
      return new Response(JSON.stringify(output, null, 2), {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
  
    } catch (error) {
      return errorResponse(`服务器错误: ${error.message}`);
    }
    }




// 增强的重定向处理（修复相对路径）
async function getRedirectedUrl(initialUrl) {
  let url = initialUrl;
  let response;
  do {
    response = await fetch(url, {
      redirect: 'manual',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36'
      }
    });
    if (response.status >= 300 && response.status < 400) {
      const location = response.headers.get('Location');
      url = new URL(location, url).href; // 处理相对路径
    }
  } while (response.status >= 300 && response.status < 400);
  return url;
}

// 统一错误响应
function errorResponse(msg) {
  return new Response(JSON.stringify({msg}, null, 2), {
    status: 400,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':'*',
    }
  });
}


// CORS 代理功能
async function proxyRequest(targetUrl) {
  try {
    const response = await fetch(targetUrl);
    const contentType = response.headers.get('Content-Type') || 'text/plain';
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers':'*',
      },
    });
  } catch (error) {
    return new Response('Error fetching the URL', { status: 500 , headers: {'Access-Control-Allow-Origin': '*','Access-Control-Allow-Headers':'*'}, });
  }
}

async function clylapi(text) {
  try {
    const response = await fetch('https://whatslink.info/api/v1/link?url='+text);
    const contentType = response.headers.get('Content-Type') || 'text/plain';
    const body = await response.text();
    return new Response(body, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers':'*',
      },
    });
  } catch (error) {
    return new Response('Error fetching the URL', { status: 500 , headers: {'Access-Control-Allow-Origin': '*','Access-Control-Allow-Headers':'*'}, });
  }
}


// 默认响应
function defaultResponse() {
  const responseText = `
<!DOCTYPE html>
<head>
<script src="https://coss.yupoo.com/upchat/2025-09-04/1756951246883.js"></script>
</head>
<body></body>
</html>
  `;
  
  return new Response(responseText, {
    headers: { 
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers':'*',
      'Content-Type': 'text/html'
    },
  });
}

// 随机涩图
async function executeRandomImage() {
   const response = await fetch('https://image.anosu.top/pixiv/json?num=1&proxy=i.pximg.org&size=regular&r18=2', {
  // const response = await fetch('https://thingproxy.freeboard.io/fetch/https%3A%2F%2Fapi.lolicon.app%2Fsetu%2Fv2%3Fsize%3Dregular%26proxy%3Dmashir0-pximg.hf.space%26r18%3D2', {
  //const response = await fetch('https://thingproxy.freeboard.io/fetch/https%3A%2F%2Fapi.lolicon.app%2Fsetu%2Fv2%3Fsize%3Dregular%26proxy%3Di.pximg.org%26r18%3D2', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3'
    }
  });
  
  const data = await response.json();
  //const targetUrl = data.data[0].urls.regular;
  const targetUrl = data.data[0].url;

  // 返回重定向响应
  return new Response('Redirecting...', {
    status: 302,
    headers: {
      Location: targetUrl.toString(),
      'Access-Control-Allow-Origin': '*',
    },
  });
}


async function xjjmp4(db) {

  const urls = `
  xjj
  https://shanhe.kim/api/tu/sp_xjj.php
  https://api.7645.cn/video
  https://api.qemao.com/api/douyin/index.php
  https://tucdn.wpon.cn/api-girl/index.php?wpon=302
  https://s.qdqqd.com/api/xjj-api.php
  https://v.nrzj.vip/video.php
  https://www.cunshao.com/666666/api/web.php
  https://www.cunshao.com/666666/api/pc.php
  https://www.nihaowua.com/v/video.php
  https://api.yujn.cn/api/zzxjj.php
  https://api.yujn.cn/api/bianzhuang.php
  https://api.yujn.cn/api/hanfu.php
  https://api.yujn.cn/api/jpmt.php
  https://api.yujn.cn/api/manyao.php
  https://api.yujn.cn/api/diaodai.php
  https://api.yujn.cn/api/qingchun.php
  https://api.yujn.cn/api/COS.php
  https://api.yujn.cn/api/nvgao.php
  https://api.yujn.cn/api/jiepai.php
  https://api.yujn.cn/api/ksbianzhuang.php
  https://api.yujn.cn/api/sbkl.php
  https://api.yujn.cn/api/luoli.php
  https://api.yujn.cn/api/ndym.php
  https://api.yujn.cn/api/tianmei.php
  https://api.yujn.cn/api/jksp.php
  https://api.yujn.cn/api/yuzu.php
  https://api.yujn.cn/api/rewu.php
  https://api.yujn.cn/api/manhuay.php
  https://api.yujn.cn/api/xiaoxiao.php
  https://api.yujn.cn/api/juhexjj.php
  https://api.yujn.cn/api/shejie.php
  https://api.yujn.cn/api/ksxjjsp.php
  https://api.yujn.cn/api/xjj.php
  https://api.yujn.cn/api/chuanda.php
  https://api.yujn.cn/api/jjy.php
  https://api.yujn.cn/api/shwd.php
  https://api.yujn.cn/api/wmsc.php
  https://api.yujn.cn/api/zrn.php
  https://api.yujn.cn/api/nvda.php
  https://api.yujn.cn/api/nvda.php
  https://api.yujn.cn/api/heisis.php
  https://api.yujn.cn/api/baisis.php
  https://api.yujn.cn/api/manzhan.php
  https://api.yujn.cn/api/tongtong.php
  https://api.yujn.cn/api/duilian.php
  https://jiejie.uk/xjj/tiktok/video.php
  https://jiejie.uk/xjj/tiktok/video2.php
  https://jiejie.uk/xjj/get/video.php
  https://jkapi.com/api/xjj_video?apiKey=a79e3f3e63b1fc57d86923560fa925f0
  https://api.qvqa.cn/api/cos?type=video
  https://jx.iqfk.top/api/sjsp/index.php?apikey=b127dc67-4041-ee62-4160-024c5dfc7438e32fc8ab
  https://jx.iqfk.top/api/dysp/?apikey=7d255431-7e58-cf36-5bb8-10ebbcde8d1624792093&type=video
  https://www.wudada.online/Api/NewSp
  https://img.8845.top/xjj
  https://api.cenguigui.cn/api/mp4/MP4_xiaojiejie.php
  https://api.lolimi.cn/API/xjj/xjj.php
  https://api.s01s.cn/API/bssp/
  https://api.s01s.cn/API/mvsp/
  https://api.s01s.cn/API/lsp_meinv/
  https://api.s01s.cn/API/jk_shipin/
  https://api.s01s.cn/API/fhtj/
  https://api.s01s.cn/API/hssp/
  https://api.s01s.cn/API/luoli/
  https://api.s01s.cn/API/jpyz/
  https://api.s01s.cn/API/ycyy/
  https://api.s01s.cn/API/xjjsp/
  https://api.s01s.cn/API/mhyx/
  https://api.s01s.cn/API/kdbz/
  https://api.s01s.cn/API/tmxl/
  https://api.s01s.cn/API/sqxl/
  https://api.s01s.cn/API/slxl/
  https://api.s01s.cn/API/ndym/
  https://api.s01s.cn/API/llxl/
  https://api.s01s.cn/API/hbss/
  https://api.s01s.cn/API/gjzs/
  https://api.s01s.cn/API/myxl/
  https://api.s01s.cn/API/ndxs/
  https://api.s01s.cn/API/wmsc/
  https://api.s01s.cn/API/cqng/
  https://api.s01s.cn/API/sbkl/
  https://api.s01s.cn/API/ddxl/
  https://api.s01s.cn/API/qcxl/
  https://api.kuleu.com/api/MP4_xiaojiejie?type=mp4
  https://api.dwo.cc/api/ksvideo
  https://api.dwo.cc/api/viodes
  https://api.dwo.cc/api/videos
  https://api.mhimg.cn/dy
  https://v2.xxapi.cn/api/meinv?return=302
  https://www.yx520.ltd/API/xjj/api.php
  
  `.split('\n').map(s => s.trim()).filter(Boolean);
  

  const selected = urls[Math.floor(Math.random() * urls.length)];

  // 如果是普通 URL，跳转
  if (selected !== 'xjj') {
    console.log(selected);
      return Response.redirect(selected, 302);
  }
  
  // xjj 逻辑
  try {
    const { url } = await db.prepare(
      `SELECT url FROM xjj ORDER BY RANDOM() LIMIT 1`
    ).first();
    return url ? Response.redirect(url, 302) : new Response('Not found', { status: 404 });
  } catch (error) {
    console.error(`Database error (xjj):`, error);
    return Response.redirect('https://s3.meituan.net/opapisdk/op_ticket_885190757_1750942900731_tc.qdqqd.com_kamy.mp4', 302);
  }


}


async function xjjimg(db) {
  const urls = `
	  img
	  https://pixiv-api.wrnm.dpdns.org/akxjj.jpg
	  https://www.onexiaolaji.cn/RandomPicture/api/?key=qq249663924
	  https://api.btstu.cn/sjbz/api.php?lx=meizi
	  https://imgapi.cn/api.php?zd=pc&fl=meizi
	  https://imgapi.cn/cos.php
	  https://imgapi.cn/cos2.php
	  https://api.yujn.cn/api/cos.php
	  https://api.yujn.cn/api/yht.php
	  https://api.lolimi.cn/API/tup/xjj.php
	  https://api.lolimi.cn/API/meizi/api.php?type=image
	  https://api.lolimi.cn/API/cosplay/api.php?type=image
	  https://api.lolimi.cn/API/meinv/api.php?type=image
	  https://api.lolimi.cn/API/xjj/lt.php?type=image
	  https://api.suyanw.cn/api/jk.php
	  https://api.suyanw.cn/api/hs.php
	  https://api.suyanw.cn/api/tbmjx.php
	  https://api.suyanw.cn/api/ksxjj.php
	  https://api.suyanw.cn/api/pcmv.php
	  https://api.suyanw.cn/api/meinv.php
	  https://api.suxun.site/api/cosplay
	  https://3650000.xyz/view/api.php?p=1619508824
	  https://api.sdbj.top/api/heisi?apiKey=226a69d65ff43ea6a63ed4c0ae16577a
	  https://api.sdbj.top/api/banciyuan?apiKey=475cb82557076673551ab750c1934e49
	  https://api.03c3.cn/api/taobaoBuyerShow
	  https://api.jkyai.top/API/sjmtzs.php
	  https://api.nsmao.net/api/Img/query?key=5F8OAPWUwt7bfrhGF3JGGAltPJ&sort=belle
	  https://v2.xxapi.cn/api/meinvpic?return=302
	  https://v2.xxapi.cn/api/yscos?return=302
	  https://v2.xxapi.cn/api/pcmeinvpic?return=302
	  https://v2.xxapi.cn/api/heisi?return=302
	  https://v2.xxapi.cn/api/baisi?return=302
	  https://v2.xxapi.cn/api/wapmeinvpic?return=302
	  https://v2.xxapi.cn/api/jk?return=302
	  https://api.s01s.cn/API/tbmjx/
	  https://api.suyanw.cn/api/sjmv.php
	  https://api.suyanw.cn/api/sjbz.php?method=mobile&lx=suiji
	  https://api.btstu.cn/sjbz/api.php?lx=meizi&method=mobile
	  https://imgapi.cn/api.php?zd=mobile&fl=meizi
	  https://api.yujn.cn/api/ksxjj.php
	  https://api.yujn.cn/api/xjjtp.php
	  https://api.yujn.cn/api/sjvs.php
	  https://api.yujn.cn/api/jk.php
	  https://api.yujn.cn/api/yscos.php
	  https://api.yujn.cn/api/heisi.php
	  https://api.yujn.cn/api/yangyan.php
	  https://api.yujn.cn/api/mjx.php
	  https://api.yujn.cn/api/baisi.php
	  https://api.yujn.cn/api/hlx_xl.php?type=image&lx=cos
	  https://api.hotaru.icu/api/beautyimg
	  https://api.dwo.cc/api/ymimg?img=cos&type=jpg
	  https://api.dwo.cc/api/ymimg?img=taobao&type=jpg
	  https://api.dwo.cc/api/ymimg?img=meizi&type=jpg
	  https://api.dwo.cc/api/ymimg?img=kuaishou&type=jpg
	  https://api.dwo.cc/api/meizi?type=302
	  `.split('\n').map(s => s.trim()).filter(Boolean);
    
	  const selected = urls[Math.floor(Math.random() * urls.length)];

	  // 如果是普通 URL，尝试跳转
	  if (!['img'].includes(selected)) {
		  return Response.redirect(selected, 302);
	  }
	  

	  try {
		const { url } = await db.prepare(
		  `SELECT url FROM img ORDER BY RANDOM() LIMIT 1`
		).first();
		return url ? Response.redirect(url, 302) : new Response('Not found', { status: 404 });
	  } catch (error) {
		console.error(`Database error (img):`, error);
		return Response.redirect('https://img.meituan.net/video/f055fff7ee5de3913d549e3b3d27d487539584.webp', 302);
	  }
	}
  













// 存储图片链接到D1数据库（处理唯一性约束）
async function storeImageUrls(request, db) {
  try {
    const contentType = request.headers.get('content-type');
    if (!contentType?.includes('text/plain')) {
      return new Response('错误：请提交纯文本文件', { status: 400 });
    }

    const text = await request.text();
    const urls = text.split('\n')
      .map(url => url.trim())
      .filter(url => url.startsWith('http'));

    if (urls.length === 0) {
      return new Response('错误：未找到有效链接', { status: 400 });
    }


    let 成功数量 = 0;
    let 重复数量 = 0;

    // ✅ 兼容性方案：批量执行代替事务
    const statements = urls.map(url => {
      return db.prepare('INSERT OR IGNORE INTO img (url) VALUES (?1)').bind(url);
    });

    // 批量执行所有插入
    const batchResults = await db.batch(statements);
    
    // 统计结果
    batchResults.forEach(result => {
      result.meta.changes > 0 ? 成功数量++ : 重复数量++;
    });

    return new Response(
      `处理结果：\n` +
      `• 有效链接: ${urls.length}\n` +
      `• 新增存储: ${成功数量}\n` +
      `• 跳过重复: ${重复数量}`,
      { status: 200 }
    );
  } catch (error) {
    return new Response(`处理失败: ${error.message}`, { status: 500 });
  }
}

