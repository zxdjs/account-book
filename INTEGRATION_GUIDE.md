# 第三方支付平台集成指南

## 一、微信账单同步集成

### 1.1 前置条件
- 企业营业执照
- 对公银行账户
- ICP备案网站/APP
- 微信商户平台账号

### 1.2 申请流程
1. 注册微信商户平台：https://pay.weixin.qq.com/
2. 提交企业资质审核
3. 申请「账单下载」API权限
4. 配置API密钥和回调URL

### 1.3 技术实现
```javascript
// 微信账单API集成示例（后端实现）
const WeChatBillIntegration = {
  // 获取对账单
  async downloadBill(date, billType = 'ALL') {
    const params = {
      appid: 'YOUR_APPID',
      mch_id: 'YOUR_MCH_ID',
      bill_date: date,
      bill_type: billType,
      nonce_str: this.generateNonceStr(),
      sign: this.generateSign(params)
    };
    
    const response = await this.request('pay/downloadbill', params);
    return this.parseBill(response);
  },
  
  // 解析账单数据
  parseBill(rawData) {
    // 解析微信返回的CSV格式账单
    // 转换为应用内部格式
  }
};
```

---

## 二、支付宝账单同步集成

### 2.1 前置条件
- 企业营业执照
- 支付宝企业账号
- 应用需通过审核

### 2.2 申请流程
1. 注册支付宝开放平台：https://open.alipay.com/
2. 创建应用并提交审核
3. 申请「查询账单」接口权限
4. 配置RSA2密钥对

### 2.3 技术实现
```javascript
// 支付宝账单API集成示例（后端实现）
const AlipayBillIntegration = {
  // 查询账单
  async queryBill(startTime, endTime) {
    const bizContent = {
      start_time: startTime,
      end_time: endTime,
      page_no: 1,
      page_size: 100
    };
    
    const params = {
      app_id: 'YOUR_APP_ID',
      method: 'alipay.data.dataservice.bill.downloadurl.query',
      charset: 'utf-8',
      sign_type: 'RSA2',
      timestamp: new Date().toISOString(),
      version: '1.0',
      biz_content: JSON.stringify(bizContent)
    };
    
    params.sign = this.generateRSASign(params);
    return await this.request(params);
  }
};
```

---

## 三、银行卡账单集成方案

### 3.1 方案选择
- **方案一：银行开放平台直连**（推荐大型企业）
  - 对接各银行开放平台
  - 优点：数据最准确
  - 缺点：开发成本高，需要金融资质
  
- **方案二：聚合支付服务商**（推荐中小企业）
  - 如云闪付开放平台、通联支付等
  - 优点：一次对接多家银行
  - 缺点：可能收取手续费

### 3.2 云闪付开放平台集成
```javascript
// 云闪付账单集成示例
const UnionPayIntegration = {
  // 获取交易记录
  async getTransactions(startDate, endDate) {
    const params = {
      merId: 'YOUR_MERCHANT_ID',
      txnTime: new Date().getTime(),
      orderId: this.generateOrderId(),
      startDate: startDate,
      endDate: endDate
    };
    
    params.sign = this.signParams(params);
    return await this.request('transactions/query', params);
  }
};
```

---

## 四、数据同步架构设计

### 4.1 整体架构
```
┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  微信支付   │    │  支付宝      │    │  银行/银联   │
│   API       │    │   API        │    │   API        │
└──────┬──────┘    └──────┬───────┘    └──────┬───────┘
       │                   │                    │
       └───────────────────┼────────────────────┘
                           │
                  ┌────────▼─────────┐
                  │   后端服务        │
                  │  (Node.js/Python) │
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │   数据处理层      │
                  │  - 格式转换       │
                  │  - 去重处理       │
                  │  - 分类映射       │
                  └────────┬─────────┘
                           │
                  ┌────────▼─────────┐
                  │   前端应用        │
                  │  (本记账本APP)    │
                  └──────────────────┘
```

### 4.2 数据安全建议
1. **HTTPS加密传输**：所有API请求使用HTTPS
2. **数据脱敏**：银行卡号、手机号等敏感信息脱敏存储
3. **本地加密**：用户数据在本地使用AES加密
4. **权限最小化**：只申请必要的API权限
5. **定期安全审计**：检查数据访问日志

---

## 五、替代方案：手动导入

对于个人开发者，可以先实现账单文件导入功能：

### 支持的格式
- CSV格式（Excel可导出）
- Excel格式（.xlsx, .xls）

### 微信账单导出步骤
1. 打开微信 → 我 → 支付 → 钱包 → 账单
2. 点击右上角「...」→ 导出账单
3. 选择导出时间范围，接收邮箱
4. 在邮箱下载CSV文件

### 支付宝账单导出步骤
1. 打开支付宝 → 我的 → 账单
2. 点击右上角「...」→ 开具交易流水证明
3. 选择「用于个人对账」
4. 下载CSV文件

---

## 六、后续开发计划

- [ ] 实现CSV账单导入解析
- [ ] 实现Excel账单导入解析
- [ ] 添加账单自动匹配分类功能
- [ ] 开发后端API服务
- [ ] 集成微信支付商户API（需企业资质）
- [ ] 集成支付宝开放平台API（需企业资质）
- [ ] 集成云闪付开放平台（需企业资质）
