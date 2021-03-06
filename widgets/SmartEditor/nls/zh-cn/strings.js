define({
  "_widgetLabel": "智能编辑器",
  "_featureAction_SmartEditor": "智能编辑器",
  "noEditPrivileges": "您的帐户不具备创建或修改数据的权限。",
  "widgetActive": "激活",
  "widgetNotActive": "不激活",
  "pressStr": "按 ",
  "ctrlStr": " Ctrl 键 ",
  "snapStr": " 以启用捕捉",
  "noAvailableTempaltes": "无可用模板",
  "editorCache": " - 编辑器缓存",
  "presetFieldAlias": "字段",
  "presetValue": "预设值",
  "usePresetValues": " 使用预设值(仅限新要素)",
  "editGeometry": " 编辑几何",
  "savePromptTitle": "保存要素",
  "savePrompt": "是否保存当前要素?",
  "deletePromptTitle": "删除要素",
  "deleteAttachment": "删除附件",
  "deletePrompt": "确定要删除所选要素?",
  "attachmentLoadingError": "上传附件时出错",
  "attachmentSaveDeleteWarning": "警告 :将自动保存对附件进行的更改",
  "autoSaveEdits": "自动保存新要素",
  "addNewFeature": "创建新要素",
  "featureCreationFailedMsg": "无法创建新记录/要素",
  "relatedItemTitle": "相关表/图层",
  "relatedFeatureCount": "包含 ${featureCount} 个要素的 ${layerTitle}",
  "createNewFeatureLabel": "为 ${layerTitle} 创建新要素",
  "invalidRelationShipMsg": "请确保主键字段：“${parentKeyField}”具有有效值",
  "pendingFeatureSaveMsg": "请在创建相关要素之前保存要素编辑内容。",
  "attachmentsRequiredMsg": "(*)需要附件。",
  "coordinatePopupTitle": "将要素移动到 XY 位置",
  "coordinatesSelectTitle": "坐标系：",
  "mapSpecialReferenceDropdownOption": "地图空间参考",
  "latLongDropdownOption": "纬度/经度",
  "mgrsDropdownOption": "军事格网参考系 (MGRS)",
  "mgrsTextBoxLabel": "坐标：",
  "xAttributeTextBoxLabel": "X 坐标：",
  "yAttributeTextBoxLabel": "Y 坐标：",
  "latitudeTextBoxLabel": "纬度：",
  "longitudeTextBoxLabel": "经度：",
  "presetGroupFieldsLabel": "“${groupName}”将应用于以下图层字段：",
  "presetGroupNoFieldsLabel": "“${groupName}”没有任何关联字段",
  "groupInfoLabel": "“${groupName}”的群组信息",
  "editGroupInfoIcon": "编辑 ${groupName} 的群组值",
  "filterEditor": {
    "all": "全部",
    "noAvailableTempaltes": "无可用模板",
    "searchTemplates": "搜索模板",
    "filterLayerLabel": "过滤图层"
  },
  "invalidConfiguration": "微件尚未配置或配置中的图层已不在地图中。请在构建器模式下打开应用程序，然后重新配置微件。",
  "geometryServiceURLNotFoundMSG": "无法获取几何服务 URL",
  "clearSelection": "关闭",
  "refreshAttributes": "更新动态要素属性",
  "automaticAttributeUpdatesOn": "自动更新要素属性：开",
  "automaticAttributeUpdatesOff": "自动更新要素属性：关",
  "moveSelectedFeatureToGPS": "将所选要素移动至当前 GPS 位置",
  "moveSelectedFeatureToXY": "将所选要素移动至 XY 位置",
  "mapNavigationLocked": "地图导航：已锁定",
  "mapNavigationUnLocked": "地图导航：已解锁",
  "copyFeatures": {
    "title": "复制要素",
    "createFeatures": "创建要素",
    "createSingleFeature": "创建 1 个多几何要素",
    "noFeaturesSelectedMessage": "未选择任何要素",
    "selectFeatureToCopyMessage": "请选择要复制的要素。",
    "multipleFeatureSaveWarning": "注意：使用复制功能创建多个要素将立即保存所有要素",
    "copyFeatureUpdateGeometryError": "无法更新所选要素的几何。",
    "canNotSaveMultipleFeatureWarning": "注：针对唯一值字段，无法使用相同的值复制多个要素，请仅选择一个要素",
    "createOnlyOneMultipartFeatureWarning": "注：只能创建一个多部分要素"
  },
  "addingFeatureError": "在图层中添加选定要素时出错。 请重试。",
  "addingFeatureErrorCount": "无法复制 '${copyFeatureErrorCount}' 要素。",
  "selectingFeatureError": "选择图层中的要素时出错。 请重试。",
  "customSelectOptionLabel": "选择要复制的要素",
  "noFeatureSelectedMessage": "未选择任何要素。",
  "multipleFeatureSaveMessage": "所有要素都将立即保存。 是否要继续?",
  "relativeDates": {
    "dateTypeLabel": "日期类型",
    "valueLabel": "值",
    "fixed": "固定",
    "current": "当前",
    "past": "过去",
    "future": "未来",
    "popupTitle": "选择值",
    "hintForFixedDateType": "提示：指定的日期和时间将用作预设默认值。",
    "hintForCurrentDateType": "提示：当前日期和时间将用作预设默认值。",
    "hintForPastDateType": "提示：将从当前日期和时间减去指定值，以获取预设默认值。",
    "hintForFutureDateType": "提示：将当前日期和时间加上指定值，以获取预设默认值。",
    "noDateDefinedTooltip": "未定义日期",
    "relativeDateWarning": "必须指定日期或时间值才能保存默认预设值。",
    "customLabel": "自定义安装",
    "layerLabel": "图层",
    "domainFieldHintLabel": "所选值为编码值属性域。 值 - 将使用 ${domainValue}。"
  },
  "valuePicker": {
    "popupTitle": "选择值",
    "popupHint": "当前要素与多个要素相交，请选择相应字段的值。",
    "buttonTooltip": "从多个相交要素中选择值"
  },
  "uniqueValueErrorMessage": "值已存在于 \"${fieldName}\" 中，请提供新值。",
  "requiredFields": {
    "displayMsg": "必填字段不能为空。 请提供以下常见字段的值。",
    "popupTittle": "所需字段",
    "foundNullRecordCount": "${fieldName} (位于 ${count} 个记录中)"
  },
  "cantLocateUserLocation": "无法确定您的位置"
});