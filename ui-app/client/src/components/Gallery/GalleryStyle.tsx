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
    ${PREFIX} .mainContainer {
      width: 100%;
      height: 100vh;
      display: flex;
      flex-direction: row;
    }
    ${PREFIX} .mainContainer.previewLeft {
      flex-direction: row-reverse;
    }
    ${PREFIX} .mainContainer.previewBottom {
      flex-direction: column;
    }
    ${PREFIX} .mainContainer.previewTop {
      flex-direction: column-reverse;
    }
    ${PREFIX} .previewContainer {
      position: relative;
      height: 100vh;
      max-width: 0px;
      max-height: none;
      transition: max-width .3s, max-height .3s;
    }
    ${PREFIX} .previewContainer.Top , ${PREFIX} .previewContainer.Bottom {
      height: auto;
      max-width: none;
      max-height: 0px;
    }
    ${PREFIX} .previewContainer.showRight,  ${PREFIX} .previewContainer.showLeft {
      max-width: 200px;
    }
    ${PREFIX} .previewContainer.showTop,  ${PREFIX} .previewContainer.showBottom {
      max-height: 140px;
    }
    ${PREFIX} .previewList {
      display: grid;
      grid-template-columns: auto auto;
      position: relative;
    }
    ${PREFIX} .previewList.Top , ${PREFIX} .previewList.Bottom {
      display: flex;
      justify-content: start;
      align-items:center;
      width: 90%;
      overflow: auto;
      overflow-y: hidden;
      height: 80px;

    }
    ${PREFIX} .previewList.hideLeft, ${PREFIX} .previewList.Top.hideTop {
      display: none;
    }
    ${PREFIX} .previewImageDiv {
      cursor: pointer;
      position: relative;
    }
    ${PREFIX} .previewImageDiv.Top , ${PREFIX} .previewImageDiv.Bottom {
      flex-shrink: 0;
    }
    ${PREFIX} .previewImage {
      width: 100%;
      height: 100%;
      position: relative;
    }
    ${PREFIX} .previewCloseIcon {
      display: flex;
      justify-content: end;
      cursor: pointer;
    }
    ${PREFIX} .previewCloseIcon i {
      position: relative;
    }
    ${PREFIX} .previewCloseIcon.hideLeft, ${PREFIX} .previewCloseIcon.hideTop {
      display: none
    }
    ${PREFIX} .galleryContainer {
      display: flex;
      flex: 1;
      flex-direction: column;
      align-items: center;
      position: relative;
    }
    ${PREFIX} .galleryContainer.thumbnailTop {
      flex-direction: column-reverse;
    }
    ${PREFIX} .galleryContainer.thumbnailRight {
      flex-direction: row;
    }
    ${PREFIX} .galleryContainer.thumbnailLeft {
      flex-direction: row-reverse;
    }
    ${PREFIX} .galleryToolbar {
      position: absolute;
      top: 0;
      right: 0;
      left: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    ${PREFIX} .galleryToolbar .rightColumn {
      display: flex;
      justify-content: flex-end;
      cursor: pointer;
      z-index: 9;
      position: relative;
    }
    ${PREFIX} .galleryToolbar .rightColumn i {
      cursor: pointer;
      position: relative;
      z-index: 10;
    }
    ${PREFIX} .galleryToolbar .leftColumn {
      z-index: 9;
      position: relative;
    }
    ${PREFIX} .thumbnailContainer {
      display: flex;
      justify-content: start;
      align-items: center;
      overflow: auto;
      overflow-y: hidden;
      max-width: none;
      transition: max-width .3s, max-height .3s, margin .3s;
      position: relative;
    }
    ${PREFIX} .thumbnailContainer.imageZoomed {
      z-index: -1;
    }
   
    ${PREFIX} .thumbnailContainer.thumbnailRight, ${PREFIX} .thumbnailContainer.thumbnailLeft {
      flex-direction: column;
      width: auto;
      max-height: none;
      overflow-y: auto;
    }
    ${PREFIX} .thumbnailContainer.thumbnailBottom.hideBottom,
    ${PREFIX} .thumbnailContainer.thumbnailTop.hideTop {
      max-height: 0;
      margin: 0 auto;
    }
    ${PREFIX} .thumbnailContainer.thumbnailRight.hideRight,
    ${PREFIX} .thumbnailContainer.thumbnailLeft.hideLeft {
      max-width: 0;
      margin: 0;
    }
    ${PREFIX} .thumbnailImageDiv {
      flex-shrink: 0;
      cursor: pointer;
      opacity: .5;
      position: relative;
    }
    ${PREFIX} .thumbnailImageDiv.selected {
      opacity: 1;
    }
    ${PREFIX} .thumbnailImage {
      width: 100%;
      height: 100%;
      position: relative;
    }
    ${PREFIX} .imageSliderContainer {
      flex: 1;
      position: relative;
      width: 100%;
      height: 100%;
      overflow: hidden;
    }
    ${PREFIX} .imageSliderContainer.imageZoomed {
      overflow: visible;
    }
    ${PREFIX} .imageSliderContainer ._eachSlide{
      display: flex;
      justify-content: center;
      align-items: center;
      margin: 4px 0;
      position: absolute;
      top: 50%;
      width: 100%;
      transform: translateY(-50%);
    }
    ${PREFIX} .slideImage {
      width: 100%;
      transition: transform .3s;
      position: relative;
    }
    ${PREFIX} .arrowButtonsContainer {
      position: absolute;
      top: 50%;
      width: 100%;
      display: flex;
      transform: translateY(-50%);
      justify-content: space-between;
      align-items: center;
      z-index: 9;
    }
    ${PREFIX} .arrowButtonsContainer.LeftTop {
      top: 10%;
      left: 0;
      width: auto;

    }
    ${PREFIX} .arrowButtonsContainer.RightTop {
      top: 10%;
      right: 0;
      width: auto;
    }
    ${PREFIX} .arrowButtonsContainer.LeftBottom {
      top: auto;
      bottom: 0;
      left: 0;
      width: auto;
    }
    ${PREFIX} .arrowButtonsContainer.RightBottom {
      top: auto;
      bottom: 0;
      right: 0;
      width: auto;
    }
    ${PREFIX} .button {
      cursor:pointer;
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
