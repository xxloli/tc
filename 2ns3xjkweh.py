import requests
import json
import re
from datetime import datetime
from flask import Flask, request, jsonify, Response, redirect, render_template
from urllib.parse import urlparse, parse_qs
import random
from typing import Optional, Dict, List, Any

app = Flask(__name__)


# 通用工具函数
def extract_middle_text(text: str, start_str: str, end_str: str) -> Optional[str]:
    start_index = text.find(start_str)
    if start_index == -1:
        return None

    start_index += len(start_str)
    end_index = text.find(end_str, start_index)
    return text[start_index:end_index] if end_index != -1 else None


def get_random_user_agent(user_agents: List[str]) -> str:
    return random.choice(user_agents)


def create_json_response(data: Dict[str, Any], status_code: int = 200) -> Response:
    response = Response(
        json.dumps(data, ensure_ascii=False, indent=4),
        mimetype='application/json;charset=utf-8',
        status=status_code
    )
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response


def create_standard_response(
        success: bool,
        media_type: str,  # 'video', 'image', 'mixed'
        items: List[Dict[str, Any]],
        title: str = "",
        author: Dict[str, str] = None,
        cover_url: str = "",
        error_msg: str = ""
) -> Dict[str, Any]:
    base = {
        "success": success,
        "media_type": media_type,
        "items": items,
        "title": title,
        "author": author or {"nickname": "", "avatar": ""},
        "cover_url": cover_url,
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
        "tips": "免费提供，仅供测试"
    }

    if not success and error_msg:
        base["error"] = error_msg

    return base



class Parser:

    def parse(self, url: str) -> Dict[str, Any]:
        raise NotImplementedError("子类必须实现parse方法")


class XiaohongshuParser(Parser):

    def parse(self, url: str) -> Dict[str, Any]:
        try:
            headers = {
                'User-Agent': 'Dalvik/2.1.0 (Linux; U; Android 14; V2417A Build/UP1A.231005.007) Resolution/1260*2800 Version/8.69.5 Build/8695125 Device/(vivo;V2417A) discover/8.69.5 NetType/WiFi'
            }

            # 获取重定向信息
            response = requests.get(url, headers=headers, allow_redirects=False, timeout=10)
            item_id = extract_middle_text(response.text, "item/", "?")
            token = extract_middle_text(response.text, "token=", "&")

            if not item_id or not token:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="无法提取必要的参数"
                )

            # 获取详细信息
            detail_url = f"https://www.xiaohongshu.com/discovery/item/{item_id}?app_platform=android&ignoreEngage=true&app_version=8.69.5&share_from_user_hidden=true&xsec_source=app_share&type=video&xsec_token={token}"
            detail_headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/536.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0"
            }

            response = requests.get(detail_url, headers=detail_headers, timeout=10)
            json_match = re.search(r"<script>window.__INITIAL_STATE__=(.*?)</script>", response.text)

            if not json_match:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="无法找到数据"
                )

            json_str = json_match.group(1).replace("undefined", "null")
            data = json.loads(json_str)
            note_data = data["note"]["noteDetailMap"][item_id]["note"]
            note_type = note_data["type"]

            author_info = {
                "nickname": note_data["user"]["nickname"],
                "avatar": note_data["user"].get("avatar", "")
            }

            if note_type == "video":
                video_url = note_data["video"]["media"]["stream"]["h264"][0]["masterUrl"]
                return create_standard_response(
                    success=True,
                    media_type="video",
                    items=[{
                        "url": video_url,
                        "resolution": f"{note_data['video'].get('width', '')}x{note_data['video'].get('height', '')}"
                    }],
                    title=note_data["title"],
                    author=author_info,
                    cover_url=note_data["video"].get("cover", "")
                )

            elif note_type == "normal":
                items = []
                cover_url = ""
                for i, image in enumerate(note_data["imageList"]):
                    if image.get("livePhoto"):
                        img_url = image["stream"]["h264"][0]["masterUrl"]
                        item_type = "video"
                    else:
                        img_url = image["infoList"][1]["url"]
                        item_type = "image"

                    item = {
                        "url": img_url,
                        "type": item_type,
                        "resolution": f"{image.get('width', '')}x{image.get('height', '')}"
                    }
                    items.append(item)

                    # 取第一张作为封面
                    if i == 0 and not cover_url:
                        cover_url = img_url

                media_type = "mixed" if any(item["type"] == "video" for item in items) else "image"

                return create_standard_response(
                    success=True,
                    media_type=media_type,
                    items=items,
                    title=note_data["title"],
                    author=author_info,
                    cover_url=cover_url
                )

            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg=f"未知的内容类型: {note_type}"
            )

        except Exception as e:
            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg=f"小红书解析失败: {str(e)}"
            )


class DouyinParser(Parser):

    def parse(self, url: str) -> Dict[str, Any]:
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 6.1; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/95.0.4638.69 Safari/537.36",
                "Cookie": "ttwid=1%7CdjUiwt-8iojVf89TbwdaPcsDLpn1fU00mKYaYCBRiHg%7C1710746734%7Ccd7960b547be86bd14c56832ffea3ec035af1704696960274f2ba4017cb0c420; bd_ticket_guard_client_web_domain=2; xgplayer_user_id=300976970825; odin_tt=cd1484c33777a5b6033eb2d704acf1325c6fa8f87f298761b34d502b2bc72e0e063bb76cafae6eda77504b92388a945495fa1bee99afaece54fadb48bd1e2eef65754e14fcd52875cf4e859f9f2797a1; xgplayer_device_id=33693820609; SEARCH_RESULT_LIST_TYPE=%22single%22; s_v_web_id=verify_lwllt9d5_131z6m2c_JOGv_4TDi_Aoje_kOMojbHCPw0e; passport_csrf_token=acfb568a5e849c00aae32c504ddcf720; passport_csrf_token_default=acfb568a5e849c00aae32c504ddcf720; UIFID_TEMP=c4683e1a43ffa6bc6852097c712d14b81f04bc9b5ca6d30214b0e66b4e3852802afe10dc759a4840b81140431eb63f5b7b9bf48388d5b2ea51d2c5499bf93eed4f464fc4a76e1d4f480f11523a92ed21; FORCE_LOGIN=%7B%22videoConsumedRemainSeconds%22%3A180%7D; fpk1=U2FsdGVkX1+zE2LbMIyeNz1bUAgXGI+GV9C9WyJchdXBQ+btbZOeBnttBI4FeWUjU8NDIweP6c2iFxNRAl9NzA==; fpk2=5f4591689f71924dbd1e95e47aec4ed7; UIFID=c4683e1a43ffa6bc6852097c712d14b81f04bc9b5ca6d30214b0e66b4e3852802afe10dc759a4840b81140431eb63f5b25c36f37f88bb35edf57e7b457b5f0552d48a4805370c354b88614ee3785e7a8d8360ba6238aea0fe85f7065584d0a57c40df70e202458dc7c81352a7d3040448ff6ed7106b36bc97733c48387da93953c97d5d7d7e128afc2d0497e2a51e4da5cae0c627ce32ce055c1b4e50a7c6b2f; vdg_s=1; pwa2=%220%7C0%7C3%7C0%22; download_guide=%223%2F20240702%2F1%22; douyin.com; device_web_cpu_core=12; device_web_memory_size=8; architecture=amd64; strategyABtestKey=%221719937555.264%22; csrf_session_id=6a4f4bf33581bf51380386b4904f13f7; __live_version__=%221.1.2.1533%22; live_use_vvc=%22false%22; webcast_leading_last_show_time=1719937582984; webcast_leading_total_show_times=1; webcast_local_quality=sd; xg_device_score=7.666140284295324; dy_swidth=1920; dy_sheight=1080; stream_recommend_feed_params=%22%7B%5C%22cookie_enabled%5C%22%3Atrue%2C%5C%22screen_width%5C%22%3A1920%2C%5C%22screen_height%5C%22%3A1080%2C%5C%22browser_online%5C%22%3Atrue%2C%5C%22cpu_core_num%5C%22%3A12%2C%5C%22device_memory%5C%22%3A8%2C%5C%22downlink%5C%22%3A10%2C%5C%22effective_type%5C%22%3A%5C%224g%5C%22%2C%5C%22round_trip_time%5C%22%3A50%7D%22; stream_player_status_params=%22%7B%5C%22is_auto_play%5C%22%3A0%2C%5C%22is_full_screen%5C%22%3A0%2C%5C%22is_full_webscreen%5C%22%3A0%2C%5C%22is_mute%5C%22%3A1%2C%5C%22is_speed%5C%22%3A1%2C%5C%22is_visible%5C%22%3A0%7D%22; WallpaperGuide=%7B%22showTime%22%3A1719918712666%2C%22closeTime%22%3A0%2C%22showCount%22%3A1%2C%22cursor1%22%3A35%2C%22cursor2%22%3A0%7D; live_can_add_dy_2_desktop=%221%22; msToken=wBlz-TD-Cxna5YP6Y4ev4-eiEy-vGNFvolT7yI6yCKrpljM0RfSXq2FE3zJSO3S19IL12WpOk-iQJCiau92GwBq0S2mK0PAxO0gIC4_EorlQk9_QAPsv; __ac_nonce=06684349d007e745bd7f4; __ac_signature=_02B4Z6wo00f01WoVPKAAAIDBXTH4.RkCqt1qNTgAADwF7SNYjgKYp2UYvulOkhbQ86-sAkiKejYGuMUddCSw4ObrljbN7dHpr-y5cdIiQpGVmJnE4aFoBhAVrazgiovkBqJ-ktLn2BQRGzSV1b; x-web-secsdk-uid=2e929dd5-0973-4520-846d-9417b0badc6f; home_can_add_dy_2_desktop=%221%22; IsDouyinActive=true; volume_info=%7B%22isUserMute%22%3Afalse%2C%22isMute%22%3Afalse%2C%22volume%22%3A0.943%7D; biz_trace_id=c3335c50; bd_ticket_guard_client_data=eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtcmVlLXB1YmxpYy1rZXkiOiJCQXpEQjRsSlMvUndUZkg0RC9MN2RCTnduN1ZRdStjU0J1YUsvQTVzZ2YyamovaWlzakpVWWgzRDY0QUE4eit5Smx5T0hmOGF6aEFWWWhEbGhRbmE3Y0E9IiwiYmQtdGlja2V0LWd1YXJkLXdlYi12ZXJzaW9uIjoxfQ%3D%3D",
            }

            # 获取重定向信息
            response = requests.get(url, headers=headers, allow_redirects=False, timeout=10)
            item_text = extract_middle_text(response.text, "/", "/?")

            if not item_text:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="无法提取视频ID"
                )

            # 提取数字部分
            numbers = re.findall(r"\d+", item_text)
            video_id = "".join(numbers)

            # 获取详细信息
            detail_url = f"https://www.douyin.com/user/self?modal_id={video_id}&showTab=like"
            response = requests.get(detail_url, headers=headers, allow_redirects=True, timeout=10)

            # 提取JSON数据
            start_str = '<script id="RENDER_DATA" type="application/json">'
            end_str = "</script>"

            if start_str not in response.text:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="无法找到数据"
                )

            json_str = response.text.split(start_str)[1].split(end_str)[0]
            json_str = requests.utils.unquote(json_str)
            data = json.loads(json_str)

            # 处理结果
            media_type = data["app"]["videoDetail"]["mediaType"]
            video_desc = re.sub(r"\r?\n", "\n", data["app"]["videoDetail"]["desc"])
            author_info = {
                "nickname": data["app"]["videoDetail"]["authorInfo"]["nickname"],
                "avatar": data["app"]["videoDetail"]["authorInfo"].get("avatarThumb", "")
            }
            cover_url = data["app"]["videoDetail"].get("coverUrl", "")

            if media_type == 4:  # 视频
                video_url = data["app"]["videoDetail"]["video"]["playApi"].split("&aid")[0]
                redirect_resp = requests.get(video_url, headers=headers, allow_redirects=False, timeout=10)
                location = redirect_resp.headers.get("Location")

                if location:
                    video_url = location.split("&btag")[0]

                return create_standard_response(
                    success=True,
                    media_type="video",
                    items=[{
                        "url": video_url,
                        "resolution": f"{data['app']['videoDetail']['video'].get('width', '')}x{data['app']['videoDetail']['video'].get('height', '')}"
                    }],
                    title=video_desc,
                    author=author_info,
                    cover_url=cover_url
                )

            elif media_type == 2:  # 图片
                images = data["app"]["videoDetail"]["images"]
                items = []
                for img in images:
                    items.append({
                        "url": img["urlList"][0],
                        "type": "image",
                        "resolution": f"{img.get('width', '')}x{img.get('height', '')}"
                    })

                return create_standard_response(
                    success=True,
                    media_type="image",
                    items=items,
                    title=video_desc,
                    author=author_info,
                    cover_url=cover_url or (items[0]["url"] if items else "")
                )

            elif media_type == 42:  # 混合内容
                images = data["app"]["videoDetail"]["images"]
                items = []

                for i, image in enumerate(images):
                    video_info = data["app"]["videoDetail"]["images"][i]["video"]
                    if video_info is None:
                        img_url = image["urlList"][0]
                        item_type = "image"
                    else:
                        img_url = video_info["playApi"].split("&aid")[0]
                        item_type = "video"

                    items.append({
                        "url": img_url,
                        "type": item_type,
                        "resolution": f"{image.get('width', '')}x{image.get('height', '')}"
                    })

                return create_standard_response(
                    success=True,
                    media_type="mixed",
                    items=items,
                    title=video_desc,
                    author=author_info,
                    cover_url=cover_url or (items[0]["url"] if items else "")
                )

            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg=f"未知的媒体类型: {media_type}"
            )

        except Exception as e:
            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg=f"抖音解析失败: {str(e)}"
            )


class KuaishouParser(Parser):

    def parse(self, url: str) -> Dict[str, Any]:
        try:
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
            }

            cookies = {
                "kpf": "PC_WEB",
                "clientid": "3",
                "did": "web_a95da6b615032b1aa95f1c6f680cfe4f",
                "kwpsecproductname": "kuaishou-vision",
                "kpn": "KUAISHOU_VISION",
                "kwssectoken": "DY1jxtheim0NNYGmnaZwQXWaUkjEz1hXDdgLyws7uchBa7Vg5A8ujOKmoat/vr8oUCtntNbbR/SaZkIFZ9bKSg==",
                "kwscode": "8aad2d2b324d894df87afb11e3e354954b83d602bf936b28b41ffd3a68336160",
                "kwfv1": "PnGU+9+Y8008S+nH0U+0mjPf8fP08f+98f+nLlwnrIP9+Y8/HFPBzj80D9+fcMPfHAPBG7PfHlPBHEwBHl+/Sj+fGEG0qE+f8Sw/ZA8eHE+/b0P/H98BGF80+Y+ADMP0PA8B+j+0qh80HU+/ZU8/ZIwnLlP/ZM+nbY+/WMw/cU8frAwBLUGfPl+/WE+nbS8/qIG/DA+04SPebf+9QYPfGAGc=="
            }

            response = requests.get(url, headers=headers, cookies=cookies, timeout=10)
            response.encoding = 'utf-8'
            html = response.text

            # 尝试解析视频
            video_pattern = re.compile(r'window.__APOLLO_STATE__\s*=\s*({.*?});', re.DOTALL)
            video_match = video_pattern.search(html)

            if video_match:
                video_data = json.loads(video_match.group(1))
                default_client = video_data.get("defaultClient", {})

                # 提取作者信息
                author_key = next((k for k in default_client.keys() if k.startswith("VisionVideoDetailAuthor:")), None)
                author_info = {"nickname": "", "avatar": ""}
                if author_key:
                    author_info = {
                        "nickname": default_client[author_key].get("name", ""),
                        "avatar": default_client[author_key].get("headerUrl", "")
                    }

                # 提取视频信息
                video_key = next((k for k in default_client.keys() if k.startswith("VisionVideoDetailPhoto:")), None)
                if video_key:
                    video_info = default_client[video_key]
                    title = video_info.get("caption", "")
                    cover_url = video_info.get("coverUrl", "")

                    # 提取视频URL
                    video_resource = video_info.get("videoResource", {})
                    json_data = video_resource.get("json", {})
                    h264 = json_data.get("h264", {})
                    adaptation_sets = h264.get("adaptationSet", [])

                    if adaptation_sets and adaptation_sets[0].get("representation", []):
                        representation = adaptation_sets[0]["representation"][0]
                        if representation.get("backupUrl", []):
                            return create_standard_response(
                                success=True,
                                media_type="video",
                                items=[{
                                    "url": representation["backupUrl"][0],
                                    "resolution": f"{representation.get('width', '')}x{representation.get('height', '')}"
                                }],
                                title=title,
                                author=author_info,
                                cover_url=cover_url
                            )

            # 尝试解析图片（如果没有找到视频）
            image_match = re.search(r"INIT_STATE = (.*?)</script>", html, re.DOTALL)
            if image_match:
                image_data = json.loads(image_match.group(1))

                # 查找图片信息对象
                image_obj = None
                for key in image_data:
                    item = image_data.get(key, {})
                    if "atlas" in item:
                        image_obj = item
                        break

                if image_obj:
                    photo = image_obj.get("photo", {})
                    title = photo.get("caption", "")
                    cover_url = photo.get("coverUrl", "")

                    author_info = {
                        "nickname": photo.get("userName", ""),
                        "avatar": photo.get("headUrl", "")
                    }

                    # 提取图片URLs
                    atlas = image_obj.get("atlas", {})
                    cdn_list = atlas.get("cdnList", [])
                    items = []

                    if cdn_list:
                        cdn = cdn_list[0].get("cdn", "")
                        image_list = atlas.get("list", [])
                        size_list = atlas.get("size", [])

                        for i in range(min(len(image_list), len(size_list))):
                            img_url = f"https://{cdn}{image_list[i]}" if cdn else image_list[i]
                            size = size_list[i]
                            items.append({
                                "url": img_url,
                                "type": "image",
                                "resolution": f"{size.get('w', '')}x{size.get('h', '')}"
                            })

                    if items:
                        return create_standard_response(
                            success=True,
                            media_type="image",
                            items=items,
                            title=title,
                            author=author_info,
                            cover_url=cover_url or items[0]["url"]
                        )

            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg="未找到任何媒体资源"
            )

        except Exception as e:
            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg=f"快手解析错误: {str(e)}"
            )


class PipixParser(Parser):

    def parse(self, url: str) -> Dict[str, Any]:
        BASE_URL = "https://api.pipix.com/bds/cell/cell_comment/?offset=0&cell_type=1&api_version=1&cell_id=%s&ac=wifi&channel=huawei_1319_64&aid=1319&app_name=super"

        PHONE_USER_AGENT = [
            "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0.0.0 Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 11_0 like Mac OS X) AppleWebKit/604.1.38 (KHTML, like Gecko) Version/11.0 Mobile/15A372 Safari/604.1",
            "Mozilla/5.0 (iPad; CPU OS 11_0 like Mac OS X) AppleWebKit/604.1.34 (KHTML, like Gecko) Version/11.0 Mobile/15A5341f Safari/604.1"
        ]

        def get_redirect_url(url: str) -> str:
            try:
                headers = {"User-Agent": get_random_user_agent(PHONE_USER_AGENT)}
                response = requests.head(url, headers=headers, allow_redirects=True, timeout=10)
                return response.url
            except:
                return url

        def get_id(url: str) -> Optional[str]:
            parsed_url = urlparse(url)
            path_segments = parsed_url.path.split('/')
            try:
                index = path_segments.index("item")
                return path_segments[index + 1] if index + 1 < len(path_segments) else None
            except ValueError:
                return None

        try:
            # 提取视频ID
            video_id = get_id(url)
            if not video_id:
                redirected_url = get_redirect_url(url)
                video_id = get_id(redirected_url)
                if not video_id:
                    return create_standard_response(
                        success=False,
                        media_type="",
                        items=[],
                        error_msg="无法获取视频ID"
                    )

            # 请求API
            headers = {"User-Agent": get_random_user_agent(PHONE_USER_AGENT)}
            response = requests.get(BASE_URL % video_id, headers=headers, timeout=10)
            response.raise_for_status()
            content = response.text

            if not content:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="解析失败"
                )

            # 解析内容
            json_data = json.loads(content)
            cell_comments = json_data.get("data", {}).get("cell_comments", [])

            if not cell_comments:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="未找到媒体信息"
                )

            item_object = cell_comments[0].get("comment_info", {}).get("item")
            if not item_object:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="未找到媒体信息"
                )

            # 提取基本信息
            title = item_object.get("content", "")
            author_info = {
                "nickname": item_object.get("author", {}).get("name", ""),
                "avatar": item_object.get("author", {}).get("avatar", {}).get("url_list", [{}])[0].get("url", "")
            }
            cover_url = ""
            items = []
            has_video = False
            has_image = False

            # 提取视频
            video_high = item_object.get("video", {}).get("video_high", {})
            if video_high:
                # 设置封面
                cover_images = video_high.get("cover_image", {}).get("url_list", [{}])
                cover_url = cover_images[0].get("url", "") if cover_images else ""

                # 添加视频
                resolution = f"{video_high.get('width', '')}x{video_high.get('height', '')}"
                for url_node in video_high.get("url_list", []):
                    items.append({
                        "url": url_node.get("url", ""),
                        "type": "video",
                        "resolution": resolution
                    })
                    has_video = True

            # 提取图片
            multi_image = item_object.get("note", {}).get("multi_image", [])
            for image in multi_image:
                url_list = image.get("url_list", [{}])
                img_url = url_list[0].get("url", "") if url_list else ""
                if img_url:
                    items.append({
                        "url": img_url,
                        "type": "image",
                        "resolution": f"{image.get('width', '')}x{image.get('height', '')}"
                    })
                    has_image = True

            # 确定媒体类型
            if has_video and has_image:
                media_type = "mixed"
            elif has_video:
                media_type = "video"
            elif has_image:
                media_type = "image"
            else:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="未找到媒体内容"
                )

            # 重置封面
            if not cover_url and items:
                for media in items:
                    if media["type"] == "image":
                        cover_url = media["url"]
                        break

            return create_standard_response(
                success=True,
                media_type=media_type,
                items=items,
                title=title,
                author=author_info,
                cover_url=cover_url
            )

        except Exception as e:
            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg=f"皮皮虾解析失败: {str(e)}"
            )


class ZuiyouParser(Parser):

    def parse(self, url: str) -> Dict[str, Any]:
        try:
            # 提取帖子ID
            parsed_url = urlparse(url)
            query_params = parse_qs(parsed_url.query)
            pid = query_params.get('pid', [None])[0]

            if not pid:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="无法提取帖子ID"
                )

            # 发送请求获取内容
            response = requests.post(
                "https://share.xiaochuankeji.cn/planck/share/post/detail_h5",
                headers={
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
                    "Content-Type": "application/json"
                },
                json={"pid": int(pid), "h_av": "5.2.13.011"},
                timeout=10
            )

            data = json.loads(response.text)
            post_data = data.get("data", {}).get("post", {})

            # 提取基础信息
            title = post_data.get("content", "")
            author_name = post_data.get("member", {}).get("name", "")
            author_info = {
                "nickname": author_name,
                "avatar": post_data.get("member", {}).get("avatar", "")
            }
            items = []
            has_video = False
            has_image = False
            cover_url = ""

            # 提取图片
            for img in post_data.get("imgs", []):
                img_urls = img.get("urls", {}).get("540_webp", {}).get("urls", [])
                if img_urls:
                    items.append({
                        "url": img_urls[0],
                        "type": "image",
                        "resolution": f"{img.get('width', '')}x{img.get('height', '')}"
                    })
                    has_image = True
                    if not cover_url:
                        cover_url = img_urls[0]

            # 提取视频
            videos = post_data.get("videos", {})
            if videos:
                video_key = next(iter(videos.keys()), None)
                if video_key:
                    video_url = videos[video_key].get("url", "")
                    if video_url:
                        items.append({
                            "url": video_url,
                            "type": "video",
                            "resolution": f"{videos[video_key].get('width', '')}x{videos[video_key].get('height', '')}"
                        })
                        has_video = True
                        if not cover_url:
                            cover_url = videos[video_key].get("cover", "")

            # 确定媒体类型
            if has_video and has_image:
                media_type = "mixed"
            elif has_video:
                media_type = "video"
            elif has_image:
                media_type = "image"
            else:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="未找到媒体资源"
                )

            return create_standard_response(
                success=True,
                media_type=media_type,
                items=items,
                title=title,
                author=author_info,
                cover_url=cover_url
            )

        except Exception as e:
            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg=f"最右解析失败: {str(e)}"
            )


class PpgxParser(Parser):

    def parse(self, url: str) -> Dict[str, Any]:
        BASE_URL = "https://h5.ippzone.com/ppapi/share/fetch_content"
        COVER_URL = "https://file.ippzone.com/img/frame/id/%s"
        TYPE = "post"

        def get_id(url: str) -> Optional[str]:
            parsed = urlparse(url)
            # 从查询参数获取pid
            query_params = parse_qs(parsed.query)
            if 'pid' in query_params:
                return query_params['pid'][0]

            # 从路径获取post后的ID
            path_segments = parsed.path.split('/')
            for i, seg in enumerate(path_segments):
                if seg == 'post' and i + 1 < len(path_segments):
                    return path_segments[i + 1]

            # 尝试获取重定向后的URL再解析
            try:
                response = requests.head(url, allow_redirects=True, timeout=10)
                return get_id(response.url)
            except:
                return None

        try:
            # 获取ID
            pid = get_id(url)
            if not pid:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="无法提取帖子ID"
                )

            # 发送请求
            headers = {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                "Content-Type": "application/json"
            }

            data = {
                "pid": int(pid),
                "type": TYPE
            }

            response = requests.post(BASE_URL, headers=headers, json=data, timeout=10)
            response.raise_for_status()
            content = response.text

            if not content:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="获取数据为空"
                )

            # 解析内容
            json_data = json.loads(content)
            data_object = json_data.get("data", {}).get("post")

            if not data_object:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="解析媒体信息失败"
                )

            # 提取信息
            title = data_object.get("content", "")
            items = []
            has_video = False
            has_image = False
            cover_url = ""

            # 提取视频
            videos = data_object.get("videos", {})
            if videos and isinstance(videos, dict):
                video_key = next(iter(videos.keys()), None)
                if video_key:
                    video_info = videos.get(video_key, {})
                    video_url = video_info.get("url", "")
                    if video_url:
                        items.append({
                            "url": video_url,
                            "type": "video",
                            "resolution": f"{video_info.get('width', '')}x{video_info.get('height', '')}"
                        })
                        has_video = True
                        if not cover_url:
                            cover_url = video_info.get("cover", "")

            # 提取图片
            imgs = data_object.get("imgs", [])
            if imgs and isinstance(imgs, list):
                for img in imgs:
                    if isinstance(img, dict) and "id" in img:
                        img_url = COVER_URL % img["id"]
                        resolution = f"{img.get('w', '')}x{img.get('h', '')}"
                        items.append({
                            "url": img_url,
                            "type": "image",
                            "resolution": resolution
                        })
                        has_image = True
                        if not cover_url:
                            cover_url = img_url

            # 确定媒体类型
            if has_video and has_image:
                media_type = "mixed"
            elif has_video:
                media_type = "video"
            elif has_image:
                media_type = "image"
            else:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="未找到媒体内容"
                )

            # 设置封面
            if not cover_url and items:
                cover_url = items[0]["url"]

            return create_standard_response(
                success=True,
                media_type=media_type,
                items=items,
                title=title,
                author={"nickname": data_object.get("userName", ""), "avatar": data_object.get("headUrl", "")},
                cover_url=cover_url
            )

        except requests.exceptions.RequestException as e:
            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg=f"网络错误: {str(e)}"
            )
        except json.JSONDecodeError:
            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg="数据解析失败"
            )
        except Exception as e:
            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg=f"处理错误: {str(e)}"
            )


class WeishiParser(Parser):

    def parse(self, url: str) -> Dict[str, Any]:
        BASE_URL = "https://h5.weishi.qq.com/webapp/json/weishi/WSH5GetPlayPage"
        USER_AGENTS = [
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
            "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1"
        ]

        try:
            # 提取帖子ID
            parsed_url = urlparse(url)
            query_params = parse_qs(parsed_url.query)
            feed_id = query_params.get('id', [None])[0]

            if not feed_id:
                # 处理可能的重定向链接
                response = requests.head(url, allow_redirects=True, timeout=10)
                parsed_redirect = urlparse(response.url)
                redirect_params = parse_qs(parsed_redirect.query)
                feed_id = redirect_params.get('id', [None])[0]

            if not feed_id:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="无法提取微视帖子ID"
                )

            # 发送请求获取数据
            headers = {
                "User-Agent": USER_AGENTS[0],
                "Content-Type": "application/json"
            }

            response = requests.post(
                BASE_URL,
                headers=headers,
                json={"feedid": feed_id},
                timeout=10
            )
            response.raise_for_status()
            content = response.text

            if not content:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="获取数据为空"
                )

            # 解析JSON数据
            json_data = json.loads(content)
            feed_info = json_data.get("data", {}).get("feeds", [{}])[0]

            if not feed_info:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="未找到帖子信息"
                )

            # 提取基础信息
            title = feed_info.get("feed_desc", "")
            author_info = {
                "nickname": feed_info.get("poster", {}).get("nick", ""),
                "avatar": feed_info.get("poster", {}).get("avatar", "")
            }
            cover_url = feed_info.get("video_cover", {}).get("static_cover", {}).get("url", "")
            items = []
            has_video = False
            has_image = False

            # 提取视频
            video_info = feed_info.get("video", {})
            if video_info:
                video_url = feed_info.get("video_url", "")
                if video_url:
                    resolution = f"{video_info.get('width', '')}x{video_info.get('height', '')}"
                    items.append({
                        "url": video_url,
                        "type": "video",
                        "resolution": resolution
                    })
                    has_video = True

            # 提取图片
            images = feed_info.get("images", [])
            for img in images:
                if isinstance(img, dict):
                    img_url = img.get("url", "")
                    if img_url:
                        resolution = f"{img.get('width', '')}x{img.get('height', '')}"
                        items.append({
                            "type": "image",
                            "url": img_url,
                            "resolution": resolution
                        })
                        has_image = True

            # 确定媒体类型
            if has_video and has_image:
                media_type = "mixed"
            elif has_video:
                media_type = "video"
            elif has_image:
                media_type = "image"
            else:
                return create_standard_response(
                    success=False,
                    media_type="",
                    items=[],
                    error_msg="未找到媒体内容"
                )

            # 重置封面（如果未设置）
            if not cover_url and items:
                cover_url = items[0]["url"]

            return create_standard_response(
                success=True,
                media_type=media_type,
                items=items,
                title=title,
                author=author_info,
                cover_url=cover_url
            )

        except requests.exceptions.RequestException as e:
            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg=f"网络错误: {str(e)}"
            )
        except json.JSONDecodeError:
            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg="数据解析失败"
            )
        except Exception as e:
            return create_standard_response(
                success=False,
                media_type="",
                items=[],
                error_msg=f"处理错误: {str(e)}"
            )



@app.route('/jx')
def handle_request():
    url = request.args.get('id')
    if not url:
        return create_json_response(create_standard_response(
            success=False,
            media_type="",
            items=[],
            error_msg="未找到 id 参数"
        ), 400)

    try:
        # 选择合适的解析器
        if "douyin" in url:
            parser = DouyinParser()
        elif "kuaishou" in url:
            parser = KuaishouParser()
        elif "pipix" in url:
            parser = PipixParser()
        elif "xiaochuankeji" in url:
            parser = ZuiyouParser()
        elif "pipigx" in url:
            parser = PpgxParser()
        elif "weishi" in url:
            parser = WeishiParser()
        else:
            parser = XiaohongshuParser()


        result = parser.parse(url)
        return create_json_response(result)

    except Exception as e:
        return create_json_response(create_standard_response(
            success=False,
            media_type="",
            items=[],
            error_msg=f"服务器错误: {str(e)}"
        ), 500)


if __name__ == '__main__':
    # 生产环境中应使用更安全的配置
    app.run(host='127.0.0.1', port=5000, debug=False)
