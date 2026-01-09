// JavaScript文件 - 处理页面交互和地图功能
// 本文件包含了欢迎页表单处理和主页地图功能的实现
// 对初学者来说，理解DOM操作、事件处理和第三方库集成是关键

// DOMContentLoaded事件：当HTML文档完全加载和解析完成后触发
// 这是编写JavaScript代码的最佳时机，确保所有DOM元素都已可用
document.addEventListener('DOMContentLoaded', function() {
    // 检查当前页面是欢迎页还是主页
    // 修改：放宽判断条件，只要不是主页且不是成员页，就尝试作为欢迎页处理
    // 或者直接检查是否存在 enter-btn 按钮
    const enterBtn = document.getElementById('enter-btn');
    const isWelcomePage = enterBtn !== null;
    
    const isMainPage = window.location.pathname.includes('main.html');
    // 成员页面判断逻辑修改：不再依赖'member'关键字，而是检查是否存在mapContainer且不是主页
    const mapContainer = document.getElementById('mapContainer');
    const isMemberPage = mapContainer && !isMainPage;
    
    // 如果是欢迎页，初始化表单功能
    if (isWelcomePage) {
        initWelcomePage();
    }
    
    // 如果是主页，初始化地图功能
    if (isMainPage) {
        initMap();
    }
    
    if (isMemberPage) {
        console.log('检测到成员页面，准备初始化地图...');
        initMemberPage();
    }
});

/**
 * 初始化欢迎页面的功能
 * 包括按钮点击事件和页面跳转
 * 
 * 这个函数负责设置欢迎页面的交互逻辑，现在是通过点击按钮直接进入主页
 */
function initWelcomePage() {
    // 开发调试用的日志输出
    console.log('初始化欢迎页面...');
    
    // 获取进入主页按钮元素
    // document.getElementById方法通过ID选择器获取DOM元素
    const enterBtn = document.getElementById('enter-btn');
    
    // 防御性编程：确保按钮元素存在再添加事件监听
    if (enterBtn) {
        // addEventListener方法用于为元素添加事件监听器
        // 参数1: 事件类型 ('click'表示点击事件)
        // 参数2: 回调函数，当事件触发时执行
        enterBtn.addEventListener('click', function() {
            console.log('点击进入主页按钮');
            
            // localStorage存储机制详解:
            // - localStorage是浏览器提供的本地存储API
            // - 存储的数据以键值对形式存在，且不会随页面刷新而丢失
            // - 存储限制约为5MB
            // - 数据只存储在客户端，不会自动同步到服务器
            
            // 记录用户访问时间到本地存储
            // new Date().toISOString()生成标准化的时间字符串
            const visitTime = new Date().toISOString();
            // localStorage.setItem(key, value)方法存储数据
            localStorage.setItem('lastVisitTime', visitTime);
            
            console.log('访问记录已保存，准备跳转到主页');
            
            // 页面跳转技术:
            // window.location.href属性用于获取或设置当前页面的URL
            // 设置新的URL值会导致浏览器导航到新页面
            window.location.href = 'main.html';
        });
    } else {
        console.warn('进入按钮元素未找到');
    }
}

/**
 * 初始化地图功能
 * 使用Leaflet.js库创建交互式地图
 * Leaflet是一个轻量级的开源JavaScript地图库
 */
function initMap() {
    console.log('初始化地图...');
    
    // 检查页面中是否有地图容器
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) {
        console.error('未找到地图容器');
        return;
    }
    
    // L.map()创建一个新的地图实例
    // 'mapContainer'是HTML中地图容器的ID
    // setView()设置地图的初始中心点和缩放级别
    // 参数格式：[纬度, 经度], 缩放级别
    const map = L.map('mapContainer').setView([39.9042, 116.4074], 13);
    
    // 定义不同的底图图层
    // tileLayer()用于加载和显示瓦片图层
    // 每个图层包含URL模板和属性配置
    const baseMaps = {
        'openstreetmap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        }),
        'stamen-terrain': L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 0,
            maxZoom: 18,
            ext: 'png'
        }),
        'stamen-watercolor': L.tileLayer('https://stamen-tiles-{s}.a.ssl.fastly.net/watercolor/{z}/{x}/{y}.{ext}', {
            attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            subdomains: 'abcd',
            minZoom: 1,
            maxZoom: 16,
            ext: 'jpg'
        })
    };
    
    // addTo()方法将图层添加到地图上
    // 这里默认显示OpenStreetMap图层
    baseMaps.openstreetmap.addTo(map);
    
    const geoServerConfig = {
        enabled: true,
        baseUrl: 'http://localhost:8080/geoserver',
        workspace: 'webgis',
        layer: 'visited_places',
        srsName: 'EPSG:4326',
        filterMemberName: null
    };
    loadVisitedPlacesFromGeoServer(map, geoServerConfig).catch(() => {
        const locations = [
            { name: '北京', lat: 39.9042, lng: 116.4074 },
            { name: '上海', lat: 31.2304, lng: 121.4737 },
            { name: '广州', lat: 23.1291, lng: 113.2644 },
            { name: '深圳', lat: 22.5431, lng: 114.0579 }
        ];
        locations.forEach(location => {
            const marker = L.marker([location.lat, location.lng]).addTo(map);
            marker.bindPopup(`<b>${location.name}</b>`);
        });
    });
    
    // 初始化地图控件
    initMapControls(map, baseMaps);
    
    // 加载省份数据（示例：加载所有成员去过的省份合集）
    // 这里为了演示，我们假设要显示一些特定的省份
    // 实际使用时，你需要先在 GeoServer 发布 china_provinces 图层
    const allVisitedProvinces = ['北京', '上海', '广东', '四川', '陕西']; 
    const provinceConfig = {
        enabled: true,
        baseUrl: 'http://localhost:8080/geoserver',
        workspace: 'webgis',
        layer: 'china_provinces', // 请确保 GeoServer 中有这个图层
        srsName: 'EPSG:4326',
        provinceField: '省'      // Shapefile 中存储省份名称的字段名
    };
    
    // 调用加载省份的函数
    loadProvinceBoundaries(map, provinceConfig, allVisitedProvinces).catch(err => {
        console.log('省份数据加载跳过（可能是 GeoServer 未配置对应图层）');
    });

    console.log('地图初始化完成');
}

function initMemberPage() {
    const memberName = document.body.dataset.memberName || '';
    console.log('初始化个人页面地图: ' + memberName);
    
    const mapContainer = document.getElementById('mapContainer');
    if (!mapContainer) {
        console.error('未找到地图容器');
        return;
    }
    
    // 强制设置高度（如果CSS未生效）
    if (mapContainer.offsetHeight === 0) {
        console.warn('地图容器高度为0，尝试强制设置高度');
        mapContainer.style.height = '500px';
    }

    const map = L.map('mapContainer').setView([39.9042, 116.4074], 5);
    const baseMaps = {
        'openstreetmap': L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap contributors'
        })
    };
    baseMaps.openstreetmap.addTo(map);
    
    // 强制触发地图重绘
    setTimeout(() => {
        map.invalidateSize();
    }, 100);
    
    // 1. 加载点状足迹（保持原有逻辑）
    const cfg = {
        enabled: true,
        baseUrl: 'http://localhost:8080/geoserver',
        workspace: 'webgis',
        layer: 'visited_places',
        srsName: 'EPSG:4326',
        filterMemberName: memberName || null
    };
    loadVisitedPlacesFromGeoServer(map, cfg).catch(() => {
        const fallback = [
            { name: memberName || '足迹', lat: 39.9042, lng: 116.4074 }
        ];
        fallback.forEach(p => {
            const m = L.marker([p.lat, p.lng]).addTo(map);
            m.bindPopup(`<b>${p.name}</b>`);
        });
    });

    // 2. 加载面状省份（新功能）
    // 定义每个成员去过的省份
    const memberProvincesMap = {
        '乔奇': ['北京', '河北'],
        '姜皓文': ['上海', '浙江'],
        '尚重润': ['广东', '福建'],
        '纪钰欣': ['江苏', '安徽'],
        '古欣喆': ['贵州','广西', '湖北', '陕西', '甘肃', '青海', '四川', '云南', '重庆', '北京', '上海', '广东', '江苏', '浙江', '福建', '江西', '安徽', '海南', '湖南', '河南', '香港', '澳门', '台湾', '山东']
    };
    
    // 如果 memberName 为空，尝试从 URL 获取（防御性编程）
    if (!memberName) {
        console.warn('memberName 为空，尝试从 URL 或文件名推断');
        // 这里可以添加更多推断逻辑，目前先保持原样，避免过度工程化
    }

    const myProvinces = memberProvincesMap[memberName] || [];
    console.log(`成员 ${memberName} 的省份列表:`, myProvinces);
    
    if (myProvinces.length > 0) {
        const provConfig = {
            enabled: true,
            baseUrl: 'http://localhost:8080/geoserver',
            workspace: 'webgis',
            layer: 'china_provinces', // 请修改为你发布的省份图层名
            srsName: 'EPSG:4326',
            provinceField: '省'      // 请修改为对应的字段名
        };
        
        loadProvinceBoundaries(map, provConfig, myProvinces).catch(err => {
            console.error('省份数据加载失败:', err);
        });
    } else {
        console.warn(`未找到成员 ${memberName} 的省份配置，或列表为空`);
    }
}

/**
 * 初始化地图控件功能
 * 实现放大、缩小和底图切换功能
 * @param {Object} map - Leaflet地图实例
 * @param {Object} baseMaps - 底图图层对象集合
 */
function initMapControls(map, baseMaps) {
    // 放大按钮
    const zoomInBtn = document.getElementById('zoomIn');
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', function() {
            map.zoomIn();
        });
    }
    
    // 缩小按钮
    const zoomOutBtn = document.getElementById('zoomOut');
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', function() {
            map.zoomOut();
        });
    }
    
    // 底图切换选择器
    const baseMapSelector = document.getElementById('baseMapSelector');
    if (baseMapSelector) {
        baseMapSelector.addEventListener('change', function() {
            const selectedMap = this.value;
            
            // 移除所有底图图层
            Object.keys(baseMaps).forEach(key => {
                if (map.hasLayer(baseMaps[key])) {
                    map.removeLayer(baseMaps[key]);
                }
            });
            
            // 添加选中的底图图层
            if (baseMaps[selectedMap]) {
                baseMaps[selectedMap].addTo(map);
            }
        });
    }
}

async function loadVisitedPlacesFromGeoServer(map, config) {
    console.log('加载足迹点...');
    
    // 优先尝试加载本地 GeoJSON 文件 (适应 GitHub Pages 部署)
    try {
        console.log('尝试加载本地 visited_places.json ...');
        const response = await fetch('visited_places.json');
        if (!response.ok) throw new Error('Local file not found');
        const data = await response.json();
        
        const layer = L.geoJSON(data, {
            filter: function(feature) {
                if (!config.filterMemberName) return true;
                // 假设 GeoJSON 中有 member 属性
                return feature.properties && feature.properties.member === config.filterMemberName;
            },
            pointToLayer: function(feature, latlng) {
                return L.marker(latlng).bindPopup(`<b>${feature.properties.member || '足迹'}</b><br>${feature.properties.location || ''}`);
            }
        });
        
        if (layer.getLayers().length === 0) {
            console.warn('本地文件中未找到匹配的足迹点');
        } else {
            layer.addTo(map);
            console.log('本地足迹点加载成功');
            return layer;
        }
    } catch (e) {
        console.warn('本地 GeoJSON 加载失败，回退到 GeoServer WMS:', e);
    }

    if (!config.enabled) throw new Error('GeoServer disabled');
    
    // 使用 WMS 加载足迹点，绕过 CORS 和 JSONP 限制
    const wmsOptions = {
        layers: `${config.workspace}:${config.layer}`,
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        attribution: 'GeoServer'
    };
    
    if (config.filterMemberName) {
        // 构造 CQL_FILTER
        wmsOptions.cql_filter = `member='${config.filterMemberName.replace(/'/g, "\\'")}'`;
    }
    
    console.log('加载足迹点 WMS 图层:', wmsOptions);
    const layer = L.tileLayer.wms(`${config.baseUrl}/wms`, wmsOptions);
    layer.addTo(map);
    
    return layer;
}
/**
 * 辅助函数：获取URL参数
 */
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

/**
 * 辅助函数：显示消息提示
 */
function showMessage(message, type = 'info') {
    // 这里可以扩展为更美观的消息提示组件
    alert(message);
}

/**
 * 从 GeoServer 加载省份边界数据
 * @param {Object} map - Leaflet地图实例
 * @param {Object} config - 配置对象
 * @param {Array} provinceNames - 要显示的省份名称列表
 */
async function loadProvinceBoundaries(map, config, provinceNames) {
    if (!provinceNames || provinceNames.length === 0) return;
    
    console.log('正在加载省份边界:', provinceNames);
    const fieldName = config.provinceField || 'name';

    // 优先尝试加载本地 GeoJSON 文件 (适应 GitHub Pages 部署)
    try {
        console.log('尝试加载本地 china_provinces.json ...');
        const response = await fetch('china_provinces.json');
        if (!response.ok) throw new Error('Local file not found');
        const data = await response.json();
        
        // 过滤数据
        const filteredFeatures = data.features.filter(feature => {
            const props = feature.properties;
            if (!props || !props[fieldName]) return false;
            // 模糊匹配逻辑
            return provinceNames.some(name => props[fieldName].includes(name));
        });
        
        if (filteredFeatures.length > 0) {
            const layer = L.geoJSON({
                type: 'FeatureCollection',
                features: filteredFeatures
            }, {
                style: {
                    fillColor: '#FF7800',
                    fillOpacity: 0.6,
                    color: '#FFFFFF',
                    weight: 1
                }
            });
            layer.addTo(map);
            console.log('本地省份数据加载成功');
            return layer;
        } else {
            console.warn('本地文件中未找到匹配的省份');
        }
    } catch (e) {
        console.warn('本地 GeoJSON 加载失败，回退到 GeoServer WMS:', e);
    }
    
    if (!config.enabled) return;

    // 构造模糊匹配的 CQL Filter (URL 长度更短)
    // 使用双引号包裹字段名以处理中文
    const filters = provinceNames.map(name => `"${fieldName}" LIKE '%${name.replace(/'/g, "''")}%'`);
    const cqlFilter = filters.join(' OR ');

    // 构造 SLD_BODY (极简模式，去除空格和换行以缩短 URL)
    const sld = `<?xml version="1.0" encoding="UTF-8"?><StyledLayerDescriptor version="1.0.0" xmlns="http://www.opengis.net/sld" xmlns:ogc="http://www.opengis.net/ogc"><NamedLayer><Name>${config.workspace}:${config.layer}</Name><UserStyle><FeatureTypeStyle><Rule><PolygonSymbolizer><Fill><CssParameter name="fill">#FF7800</CssParameter><CssParameter name="fill-opacity">0.6</CssParameter></Fill><Stroke><CssParameter name="stroke">#FFFFFF</CssParameter><CssParameter name="stroke-width">1</CssParameter></Stroke></PolygonSymbolizer></Rule></FeatureTypeStyle></UserStyle></NamedLayer></StyledLayerDescriptor>`;

    // 生成调试链接
    const debugUrl = `${config.baseUrl}/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=${config.workspace}:${config.layer}&maxFeatures=1&outputFormat=application/json`;
    
    // 生成 WMS 调试链接 (手动拼接参数，方便用户检查错误)
    const wmsUrl = `${config.baseUrl}/wms?service=WMS&version=1.1.0&request=GetMap&layers=${config.workspace}:${config.layer}&format=image/png&transparent=true&srs=EPSG:4326&bbox=73,18,135,54&width=768&height=330&cql_filter=${encodeURIComponent(cqlFilter)}&sld_body=${encodeURIComponent(sld)}`;
    
    console.log(`[调试] 1. 字段名检查: ${debugUrl}`);
    console.log(`[调试] 2. CQL过滤器: ${cqlFilter}`);
    console.log(`[调试] 3. WMS图片链接 (如果点击报错，说明 URL 太长): ${wmsUrl}`);
    
    // 使用 WMS 服务加载图片图层
    const wmsLayer = L.tileLayer.wms(`${config.baseUrl}/wms`, {
        layers: `${config.workspace}:${config.layer}`,
        format: 'image/png',
        transparent: true,
        version: '1.1.0',
        sld_body: sld,    // 样式定义（橙色）
        cql_filter: cqlFilter, // 数据过滤
        attribution: 'GeoServer'
    });
    
    wmsLayer.addTo(map);
    return wmsLayer;
}

/**
 * 简单的 JSONP 实现
 * GeoServer 默认的 JSONP 回调函数名是 parseResponse
 */
function fetchJsonp(url) {
    return new Promise((resolve, reject) => {
        const callbackName = 'parseResponse'; // GeoServer 默认回调名
        
        // 定义全局回调函数
        window[callbackName] = function(data) {
            delete window[callbackName]; // 清理全局变量
            document.body.removeChild(script); // 移除 script 标签
            resolve(data);
        };
        
        // 创建 script 标签
        const script = document.createElement('script');
        script.src = url + '&format_options=callback:' + callbackName;
        script.onerror = () => {
            delete window[callbackName];
            document.body.removeChild(script);
            reject(new Error('JSONP request failed'));
        };
        
        document.body.appendChild(script);
    });
}