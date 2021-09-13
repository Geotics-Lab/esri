System.register(["esri/widgets/Editor","jimu-arcgis","jimu-core"], function(__WEBPACK_DYNAMIC_EXPORT__) {
	var __WEBPACK_EXTERNAL_MODULE_esri_widgets_Editor__, __WEBPACK_EXTERNAL_MODULE_jimu_arcgis__, __WEBPACK_EXTERNAL_MODULE_jimu_core__;
	return {
		setters: [
			function(module) {
				__WEBPACK_EXTERNAL_MODULE_esri_widgets_Editor__ = module;
			},
			function(module) {
				__WEBPACK_EXTERNAL_MODULE_jimu_arcgis__ = module;
			},
			function(module) {
				__WEBPACK_EXTERNAL_MODULE_jimu_core__ = module;
			}
		],
		execute: function() {
			__WEBPACK_DYNAMIC_EXPORT__(
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./your-extensions/widgets/editor/src/runtime/widget.tsx");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./your-extensions/widgets/editor/src/runtime/widget.tsx":
/*!***************************************************************!*\
  !*** ./your-extensions/widgets/editor/src/runtime/widget.tsx ***!
  \***************************************************************/
/*! exports provided: default */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, \"default\", function() { return Widget; });\n/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! jimu-core */ \"jimu-core\");\n/* harmony import */ var jimu_core__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(jimu_core__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! jimu-arcgis */ \"jimu-arcgis\");\n/* harmony import */ var jimu_arcgis__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__);\n/* harmony import */ var esri_widgets_Editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! esri/widgets/Editor */ \"esri/widgets/Editor\");\n/* harmony import */ var esri_widgets_Editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(esri_widgets_Editor__WEBPACK_IMPORTED_MODULE_2__);\n/**\r\n  Licensing\r\n\r\n  Copyright 2021 Esri\r\n\r\n  Licensed under the Apache License, Version 2.0 (the \"License\"); You\r\n  may not use this file except in compliance with the License. You may\r\n  obtain a copy of the License at\r\n  http://www.apache.org/licenses/LICENSE-2.0\r\n\r\n  Unless required by applicable law or agreed to in writing, software\r\n  distributed under the License is distributed on an \"AS IS\" BASIS,\r\n  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or\r\n  implied. See the License for the specific language governing\r\n  permissions and limitations under the License.\r\n\r\n  A copy of the license is available in the repository's\r\n  LICENSE file.\r\n*/\r\n/** @jsx jsx */\r\n\r\n\r\n\r\nclass Widget extends jimu_core__WEBPACK_IMPORTED_MODULE_0__[\"React\"].PureComponent {\r\n    constructor(props) {\r\n        super(props);\r\n        this.myRef = jimu_core__WEBPACK_IMPORTED_MODULE_0__[\"React\"].createRef();\r\n        this.activeViewChangeHandler = (jmv) => {\r\n            if (this.state.jimuMapView) {\r\n                if (this.state.currentWidget) {\r\n                    this.state.currentWidget.destroy();\r\n                }\r\n            }\r\n            if (jmv) {\r\n                this.setState({\r\n                    jimuMapView: jmv\r\n                });\r\n                if (this.myRef.current) {\r\n                    const newEditor = new esri_widgets_Editor__WEBPACK_IMPORTED_MODULE_2__({\r\n                        view: jmv.view,\r\n                        container: this.myRef.current\r\n                    });\r\n                    this.setState({\r\n                        currentWidget: newEditor\r\n                    });\r\n                }\r\n                else {\r\n                    console.error('could not find this.myRef.current');\r\n                }\r\n            }\r\n        };\r\n        this.componentDidUpdate = evt => {\r\n            if (this.props.useMapWidgetIds && this.props.useMapWidgetIds.length === 0) {\r\n                if (this.state.currentWidget) {\r\n                    this.state.currentWidget.destroy();\r\n                }\r\n            }\r\n        };\r\n        this.state = {\r\n            jimuMapView: null,\r\n            currentWidget: null\r\n        };\r\n    }\r\n    render() {\r\n        var _a;\r\n        let mvc = Object(jimu_core__WEBPACK_IMPORTED_MODULE_0__[\"jsx\"])(\"p\", null, \"Please select a map.\");\r\n        const css = `\n    .esri-editor__scroller {\n      overflow-y: auto;\n      padding-top: $cap-spacing--half;\n      padding-bottom: $cap-spacing;\n      max-height: 1em;\n      }\n      .esri-editor__content-group {\n        max-height: 1em;\n      }\n\n      `;\r\n        if (this.props.hasOwnProperty(\"useMapWidgetIds\") &&\r\n            this.props.useMapWidgetIds &&\r\n            this.props.useMapWidgetIds[0]) {\r\n            mvc = (Object(jimu_core__WEBPACK_IMPORTED_MODULE_0__[\"jsx\"])(jimu_arcgis__WEBPACK_IMPORTED_MODULE_1__[\"JimuMapViewComponent\"], { useMapWidgetId: (_a = this.props.useMapWidgetIds) === null || _a === void 0 ? void 0 : _a[0], onActiveViewChange: this.activeViewChangeHandler }));\r\n        }\r\n        return (Object(jimu_core__WEBPACK_IMPORTED_MODULE_0__[\"jsx\"])(\"div\", { className: \"widget-js-api-editor\", style: { height: \"100%\", overflow: \"auto\" } },\r\n            Object(jimu_core__WEBPACK_IMPORTED_MODULE_0__[\"jsx\"])(\"div\", { ref: this.myRef },\r\n                Object(jimu_core__WEBPACK_IMPORTED_MODULE_0__[\"jsx\"])(\"style\", null, css)),\r\n            mvc));\r\n    }\r\n}\r\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiLi95b3VyLWV4dGVuc2lvbnMvd2lkZ2V0cy9lZGl0b3Ivc3JjL3J1bnRpbWUvd2lkZ2V0LnRzeC5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy8uL3lvdXItZXh0ZW5zaW9ucy93aWRnZXRzL2VkaXRvci9zcmMvcnVudGltZS93aWRnZXQudHN4PzQ5NzgiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gIExpY2Vuc2luZ1xuXG4gIENvcHlyaWdodCAyMDIxIEVzcmlcblxuICBMaWNlbnNlZCB1bmRlciB0aGUgQXBhY2hlIExpY2Vuc2UsIFZlcnNpb24gMi4wICh0aGUgXCJMaWNlbnNlXCIpOyBZb3VcbiAgbWF5IG5vdCB1c2UgdGhpcyBmaWxlIGV4Y2VwdCBpbiBjb21wbGlhbmNlIHdpdGggdGhlIExpY2Vuc2UuIFlvdSBtYXlcbiAgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICBodHRwOi8vd3d3LmFwYWNoZS5vcmcvbGljZW5zZXMvTElDRU5TRS0yLjBcblxuICBVbmxlc3MgcmVxdWlyZWQgYnkgYXBwbGljYWJsZSBsYXcgb3IgYWdyZWVkIHRvIGluIHdyaXRpbmcsIHNvZnR3YXJlXG4gIGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBMaWNlbnNlIGlzIGRpc3RyaWJ1dGVkIG9uIGFuIFwiQVMgSVNcIiBCQVNJUyxcbiAgV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yXG4gIGltcGxpZWQuIFNlZSB0aGUgTGljZW5zZSBmb3IgdGhlIHNwZWNpZmljIGxhbmd1YWdlIGdvdmVybmluZ1xuICBwZXJtaXNzaW9ucyBhbmQgbGltaXRhdGlvbnMgdW5kZXIgdGhlIExpY2Vuc2UuXG5cbiAgQSBjb3B5IG9mIHRoZSBsaWNlbnNlIGlzIGF2YWlsYWJsZSBpbiB0aGUgcmVwb3NpdG9yeSdzXG4gIExJQ0VOU0UgZmlsZS5cbiovXG4vKiogQGpzeCBqc3ggKi9cbmltcG9ydCB7IEFsbFdpZGdldFByb3BzLCBCYXNlV2lkZ2V0LCBqc3gsIFJlYWN0IH0gZnJvbSBcImppbXUtY29yZVwiO1xuaW1wb3J0IHsgSmltdU1hcFZpZXdDb21wb25lbnQsIEppbXVNYXBWaWV3IH0gZnJvbSBcImppbXUtYXJjZ2lzXCI7XG5pbXBvcnQgKiBhcyBFZGl0b3IgZnJvbSAnZXNyaS93aWRnZXRzL0VkaXRvcidcblxuXG5pbnRlcmZhY2UgU3RhdGUge1xuICBqaW11TWFwVmlldzogSmltdU1hcFZpZXc7XG4gIGN1cnJlbnRXaWRnZXQ6IEVkaXRvcjtcbn1cblxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBXaWRnZXQgZXh0ZW5kcyBSZWFjdC5QdXJlQ29tcG9uZW50PEFsbFdpZGdldFByb3BzPHt9PiwgU3RhdGU+e1xuXG4gIHByaXZhdGUgbXlSZWYgPSBSZWFjdC5jcmVhdGVSZWY8SFRNTERpdkVsZW1lbnQ+KCk7XG5cbiAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICBzdXBlcihwcm9wcyk7XG4gICAgdGhpcy5zdGF0ZSA9IHtcbiAgICAgIGppbXVNYXBWaWV3OiBudWxsLFxuICAgICAgY3VycmVudFdpZGdldDogbnVsbFxuICAgIH07XG4gIH1cblxuICBhY3RpdmVWaWV3Q2hhbmdlSGFuZGxlciA9IChqbXY6IEppbXVNYXBWaWV3KSA9PiB7XG4gICAgaWYgKHRoaXMuc3RhdGUuamltdU1hcFZpZXcpIHtcbiAgICAgIGlmICh0aGlzLnN0YXRlLmN1cnJlbnRXaWRnZXQpIHtcbiAgICAgICAgdGhpcy5zdGF0ZS5jdXJyZW50V2lkZ2V0LmRlc3Ryb3koKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoam12KSB7XG4gICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgamltdU1hcFZpZXc6IGptdlxuICAgICAgfSk7XG5cbiAgICAgIGlmICh0aGlzLm15UmVmLmN1cnJlbnQpIHtcbiAgICAgICAgY29uc3QgbmV3RWRpdG9yID0gbmV3IEVkaXRvcih7XG4gICAgICAgICAgdmlldzogam12LnZpZXcsXG4gICAgICAgICAgY29udGFpbmVyOiB0aGlzLm15UmVmLmN1cnJlbnRcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7XG4gICAgICAgICAgY3VycmVudFdpZGdldDogbmV3RWRpdG9yXG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcignY291bGQgbm90IGZpbmQgdGhpcy5teVJlZi5jdXJyZW50Jyk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIGNvbXBvbmVudERpZFVwZGF0ZSA9IGV2dCA9PiB7XG5cbiAgICBpZiAodGhpcy5wcm9wcy51c2VNYXBXaWRnZXRJZHMgJiYgdGhpcy5wcm9wcy51c2VNYXBXaWRnZXRJZHMubGVuZ3RoID09PSAwKSB7XG4gICAgICBpZiAodGhpcy5zdGF0ZS5jdXJyZW50V2lkZ2V0KSB7XG4gICAgICAgIHRoaXMuc3RhdGUuY3VycmVudFdpZGdldC5kZXN0cm95KCk7XG4gICAgICB9XG4gICAgfVxuICB9O1xuXG4gIHJlbmRlcigpIHtcblxuICAgIGxldCBtdmMgPSA8cD5QbGVhc2Ugc2VsZWN0IGEgbWFwLjwvcD47XG5cbiAgICBjb25zdCBjc3MgPSBgXG4gICAgLmVzcmktZWRpdG9yX19zY3JvbGxlciB7XG4gICAgICBvdmVyZmxvdy15OiBhdXRvO1xuICAgICAgcGFkZGluZy10b3A6ICRjYXAtc3BhY2luZy0taGFsZjtcbiAgICAgIHBhZGRpbmctYm90dG9tOiAkY2FwLXNwYWNpbmc7XG4gICAgICBtYXgtaGVpZ2h0OiAxZW07XG4gICAgICB9XG4gICAgICAuZXNyaS1lZGl0b3JfX2NvbnRlbnQtZ3JvdXAge1xuICAgICAgICBtYXgtaGVpZ2h0OiAxZW07XG4gICAgICB9XG5cbiAgICAgIGBcbiAgICBpZiAoXG4gICAgICB0aGlzLnByb3BzLmhhc093blByb3BlcnR5KFwidXNlTWFwV2lkZ2V0SWRzXCIpICYmXG4gICAgICB0aGlzLnByb3BzLnVzZU1hcFdpZGdldElkcyAmJlxuICAgICAgdGhpcy5wcm9wcy51c2VNYXBXaWRnZXRJZHNbMF1cbiAgICApIHtcbiAgICAgIG12YyA9IChcbiAgICAgICAgPEppbXVNYXBWaWV3Q29tcG9uZW50XG4gICAgICAgICAgdXNlTWFwV2lkZ2V0SWQ9e3RoaXMucHJvcHMudXNlTWFwV2lkZ2V0SWRzPy5bMF19XG4gICAgICAgICAgb25BY3RpdmVWaWV3Q2hhbmdlPXt0aGlzLmFjdGl2ZVZpZXdDaGFuZ2VIYW5kbGVyfVxuICAgICAgICAvPlxuICAgICAgKTtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdlxuICAgICAgY2xhc3NOYW1lPVwid2lkZ2V0LWpzLWFwaS1lZGl0b3JcIlxuICAgICAgc3R5bGU9e3sgaGVpZ2h0OiBcIjEwMCVcIiAsIG92ZXJmbG93OiBcImF1dG9cIiB9fVxuICAgICAgPlxuICAgICAgIDxkaXYgcmVmPXt0aGlzLm15UmVmfT5cbiAgICAgICAgICA8c3R5bGU+XG4gICAgICAgICAgICB7Y3NzfVxuICAgICAgICAgIDwvc3R5bGU+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICB7bXZjfVxuICAgICAgPC9kaXY+XG4gICAgKTtcbiAgfVxufSJdLCJtYXBwaW5ncyI6IkFBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBO0FBQUE7QUFBQTtBQUFBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFrQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQVNBO0FBSUE7QUFDQTtBQUhBO0FBVUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFDQTtBQUNBO0FBQ0E7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBRUE7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUF4Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQXNDQTs7QUFFQTtBQUVBOzs7Ozs7Ozs7OztBQVdBO0FBQ0E7QUFFQTtBQUNBO0FBRUE7QUFNQTtBQUVBO0FBS0E7QUFDQTtBQUlBO0FBR0E7QUFDQTsiLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///./your-extensions/widgets/editor/src/runtime/widget.tsx\n");

/***/ }),

/***/ "esri/widgets/Editor":
/*!**************************************!*\
  !*** external "esri/widgets/Editor" ***!
  \**************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_esri_widgets_Editor__;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZXNyaS93aWRnZXRzL0VkaXRvci5qcyIsInNvdXJjZXMiOlsid2VicGFjazovLy9leHRlcm5hbCBcImVzcmkvd2lkZ2V0cy9FZGl0b3JcIj8wODlkIl0sInNvdXJjZXNDb250ZW50IjpbIm1vZHVsZS5leHBvcnRzID0gX19XRUJQQUNLX0VYVEVSTkFMX01PRFVMRV9lc3JpX3dpZGdldHNfRWRpdG9yX187Il0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///esri/widgets/Editor\n");

/***/ }),

/***/ "jimu-arcgis":
/*!******************************!*\
  !*** external "jimu-arcgis" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_arcgis__;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamltdS1hcmNnaXMuanMiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJqaW11LWFyY2dpc1wiPzlmMWMiXSwic291cmNlc0NvbnRlbnQiOlsibW9kdWxlLmV4cG9ydHMgPSBfX1dFQlBBQ0tfRVhURVJOQUxfTU9EVUxFX2ppbXVfYXJjZ2lzX187Il0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///jimu-arcgis\n");

/***/ }),

/***/ "jimu-core":
/*!****************************!*\
  !*** external "jimu-core" ***!
  \****************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = __WEBPACK_EXTERNAL_MODULE_jimu_core__;//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiamltdS1jb3JlLmpzIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiamltdS1jb3JlXCI/YzY5NSJdLCJzb3VyY2VzQ29udGVudCI6WyJtb2R1bGUuZXhwb3J0cyA9IF9fV0VCUEFDS19FWFRFUk5BTF9NT0RVTEVfamltdV9jb3JlX187Il0sIm1hcHBpbmdzIjoiQUFBQSIsInNvdXJjZVJvb3QiOiIifQ==\n//# sourceURL=webpack-internal:///jimu-core\n");

/***/ })

/******/ })
			);
		}
	};
});