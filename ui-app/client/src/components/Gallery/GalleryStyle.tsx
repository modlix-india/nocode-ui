import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition, processStyleValueWithFunction } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './galleryStyleProperties';

const PREFIX = '.comp.compGallery';
export default function GalleryStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const values = new Map<string, string>([
		...Array.from(theme.get(StyleResolution.ALL) ?? []),
		...Array.from(styleDefaults),
	]);
	const css =
		`
    ${PREFIX} {
      z-index: 8;
      position: fixed;
      top: 0;
      right: 0;
      bottom: 0;
      left: 0;  
      backdrop-filter: blur(${processStyleValueWithFunction(values.get('backdropFilter'), values)}) 
    }
    ${PREFIX} ._mainContainer {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: row;
    }
    ${PREFIX} ._mainContainer._previewLeft {
      flex-direction: row-reverse;
    }
    ${PREFIX} ._mainContainer._previewBottom {
      flex-direction: column;
    }
    ${PREFIX} ._mainContainer._previewTop {
      flex-direction: column-reverse;
    }
    ${PREFIX} ._previewContainer {
      position: relative;
      height: 100vh;
      max-width: 0px;
      max-height: none;
      transition: max-width .3s, max-height .3s;
    }
    ${PREFIX} ._previewContainer._Top , ${PREFIX} ._previewContainer._Bottom {
      height: auto;
      max-width: none;
      max-height: 0px;
    }
    ${PREFIX} ._previewContainer._showRight,  ${PREFIX} ._previewContainer._showLeft {
      max-width: 200px;
    }
    ${PREFIX} ._previewContainer._showTop,  ${PREFIX} ._previewContainer._showBottom {
      max-height: 140px;
    }
    ${PREFIX} ._previewList {
      display: grid;
      grid-template-columns: auto auto;
      position: relative;
    }
    ${PREFIX} ._previewList._Top , ${PREFIX} ._previewList._Bottom {
      display: flex;
      justify-content: start;
      align-items:center;
      width: 90%;
      overflow: auto;
      overflow-y: hidden;
      height: 80px;

    }
    ${PREFIX} ._previewList._hideLeft, ${PREFIX} ._previewList._Top._hideTop {
      display: none;
    }
    ${PREFIX} ._previewImageDiv {
      cursor: pointer;
      position: relative;
    }
    ${PREFIX} ._previewImageDiv._Top , ${PREFIX} ._previewImageDiv._Bottom {
      flex-shrink: 0;
    }
    ${PREFIX} ._previewImage {
      width: 100%;
      height: 100%;
      position: relative;
    }
    ${PREFIX} ._previewCloseIcon {
      display: flex;
      justify-content: end;
      cursor: pointer;
    }
    ${PREFIX} ._previewCloseIcon i {
      position: relative;
    }
    ${PREFIX} ._previewCloseIcon._hideLeft, ${PREFIX} ._previewCloseIcon._hideTop {
      display: none
    }
    ${PREFIX} ._galleryContainer {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    ${PREFIX} ._galleryContainer._thumbnailTop {
      flex-direction: column-reverse;
    }
    ${PREFIX} ._galleryContainer._thumbnailRight {
      flex-direction: row;
    }
    ${PREFIX} ._galleryContainer._thumbnailLeft {
      flex-direction: row-reverse;
    }
    ${PREFIX} ._galleryToolbar {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    ${PREFIX} ._galleryToolbar ._rightColumn {
      display: flex;
      justify-content: flex-end;
      cursor: pointer;
      z-index: 9;
      position: relative;
    }
    ${PREFIX} ._galleryToolbar ._rightColumn i {
      cursor: pointer;
      position: relative;
      z-index: 10;
    }
    ${PREFIX} ._galleryToolbar ._leftColumn {
      z-index: 9;
      position: relative;
    }
    ${PREFIX} ._thumbnailContainer {
      display: flex;
      justify-content: start;
      align-items: center;
      overflow: auto;
      overflow-y: hidden;
      max-width: none;
      transition: max-width .3s, max-height .3s, margin .3s;
      position: relative;
    }
    ${PREFIX} ._thumbnailContainer._imageZoomed {
      z-index: -1;
    }
   
    ${PREFIX} ._thumbnailContainer._thumbnailRight, ${PREFIX} ._thumbnailContainer._thumbnailLeft {
      flex-direction: column;
      width: auto;
      max-height: none;
      overflow-y: auto;
    }
    ${PREFIX} ._thumbnailContainer._thumbnailBottom._hideBottom,
    ${PREFIX} ._thumbnailContainer._thumbnailTop._hideTop {
      max-height: 0;
      margin: 0 auto;
    }
    ${PREFIX} ._thumbnailContainer._thumbnailRight._hideRight,
    ${PREFIX} ._thumbnailContainer._thumbnailLeft._hideLeft {
      max-width: 0;
      margin: 0;
    }
    ${PREFIX} ._thumbnailImageDiv {
      flex-shrink: 0;
      cursor: pointer;
      opacity: .5;
      position: relative;
    }
    ${PREFIX} ._thumbnailImageDiv._selected {
      opacity: 1;
    }
    ${PREFIX} ._thumbnailImage {
      width: 100%;
      height: 100%;
      position: relative;
    }
    ${PREFIX} ._imageSliderContainer {
      flex: 1;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    ${PREFIX} ._imageSliderContainer._imageZoomed {
      overflow: visible;
    }
    ${PREFIX} ._imageSliderContainer ._eachSlide{
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 4px 0;
      position: absolute;
      top: 50%;
      width: 100%;
      transform: translateY(-50%);
    }
    ${PREFIX} ._slideImage {
      width: 100%;
      transition: transform .3s;
      position: relative;
    }
    ${PREFIX} ._arrowButtonsContainer {
      position: absolute;
      top: 50%;
      width: 100%;
      display: flex;
      transform: translateY(-50%);
      justify-content: space-between;
      align-items: center;
      z-index: 9;
    }
    ${PREFIX} ._arrowButtonsContainer._LeftTop {
      top: 10%;
      left: 0;
      width: auto;

    }
    ${PREFIX} ._arrowButtonsContainer._RightTop {
      top: 10%;
      right: 0;
      width: auto;
    }
    ${PREFIX} ._arrowButtonsContainer._LeftBottom {
      top: auto;
      bottom: 0;
      left: 0;
      width: auto;
    }
    ${PREFIX} ._arrowButtonsContainer._RightBottom {
      top: auto;
      bottom: 0;
      right: 0;
      width: auto;
    }
    ${PREFIX} ._button {
      cursor: pointer;
      position: relative;
    }

    ${PREFIX} ._eachSlide._current._slideover{
      left: 100%;
    }
    ${PREFIX} ._eachSlide._current._slideover._slideoverStart{
        left: 0px;
    }

    ${PREFIX} ._eachSlide._current._slideover._reverse{
        left: -100%;
    }
    ${PREFIX} ._eachSlide._current._slideover._slideoverStart._reverse{
        left: 0px;
    }

    ${PREFIX} ._eachSlide._current._fadeover{
        opacity: 0;
    }
    ${PREFIX} ._eachSlide._current._fadeoverStart{
        opacity: 1;
    }

    ${PREFIX} ._eachSlide._current._fadeoutin{
        opacity: 0;
    }
    ${PREFIX} ._eachSlide._current._fadeoutinStart{
        opacity: 1;
    }

    ${PREFIX} ._eachSlide._previous._fadeoutin{
        opacity: 1;
    }
    ${PREFIX} ._eachSlide._previous._fadeoutinStart{
        opacity: 0;
    }

    ${PREFIX} ._eachSlide._current._crossover{
        opacity: 0;
    }
    ${PREFIX} ._eachSlide._current._crossoverStart{
        opacity: 1;
    }

    ${PREFIX} ._eachSlide._previous._crossover{
        opacity: 1;
    }
    ${PREFIX} ._eachSlide._previous._crossoverStart{
        opacity: 0;
    }

    ${PREFIX} ._eachSlide._current._slide{
        left: 100%;
    }
    ${PREFIX} ._eachSlide._current._slide._slideStart{
        left: 0px;
    }
    ${PREFIX} ._eachSlide._current._slide._reverse{
        left: -100%;
    }
    ${PREFIX} ._eachSlide._current._slide._slideStart._reverse{
        left: 0px;
    }

    ${PREFIX} ._eachSlide._previous._slide{
        left: 0px;
    }
    ${PREFIX} ._eachSlide._previous._slide._slideStart{
        left: -100%;
    }
    ${PREFIX} ._eachSlide._previous._slide._reverse{
        left: 0%;
    }
    ${PREFIX} ._eachSlide._previous._slide._slideStart._reverse{
        left: 100%;
    }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="GalleryCss">{css}</style>;
}
