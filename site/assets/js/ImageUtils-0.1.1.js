"use strict";

Prime.Document.onReady(function () {
    const SAFARI_TOP_WIDTH = 1448,
        SAFARI_TOP_HEIGHT = 68,
        $WRAPPERS = [];
    let $CONTAINER,
        CONTAINER_WIDTH;

    const resizeImage = function ($node, $child, $wrapper) {
        let imageWidth = parseFloat($node.attributes.width?.value || 0);
        imageWidth = (imageWidth) ? Math.min(imageWidth, CONTAINER_WIDTH) : CONTAINER_WIDTH;
        if (!imageWidth) {
            return;
        }

        const ratio = Math.min(imageWidth / SAFARI_TOP_WIDTH, 1);
        $wrapper.style.width = imageWidth + 'px';
        $child.style.height = (ratio * SAFARI_TOP_HEIGHT) + 'px';

        if (ratio < 0.5) {
            $wrapper.classList.add('safari-wrapper-sm');
        } else {
            $wrapper.classList.remove('safari-wrapper-sm');
        }
    }

    const calculateContainerWidth = function () {
        const style = window.getComputedStyle($CONTAINER);
        CONTAINER_WIDTH = parseFloat(style.width) - parseFloat(style.paddingLeft || 0);
    }

    document.querySelectorAll('img.safari').forEach(function ($node) {
        if (!$CONTAINER) {
            $CONTAINER = $node.parentNode;
            calculateContainerWidth();
        }

        const $wrapper = document.createElement('div');
        const $safariTitleBar = document.createElement('div');
        $wrapper.classList.add('safari-wrapper');

        resizeImage($node, $safariTitleBar, $wrapper);
        $WRAPPERS.push([$node, $safariTitleBar, $wrapper]);

        $wrapper.appendChild($safariTitleBar);
        $node.parentNode.insertBefore($wrapper, $node);
        $wrapper.appendChild($node);
    });

    window.addEventListener('resize', function () {
        calculateContainerWidth();
        $WRAPPERS.forEach(function ([$node, $child, $wrapper]) {
            resizeImage($node, $child, $wrapper)
        });
    });
});
