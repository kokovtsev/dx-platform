import * as React from 'react';
import { PURE } from '@devexperts/utils/lib/react/pure';
import { withTheme } from '@devexperts/utils/lib/react/withTheme';
import { ComponentClass } from 'react';
import { ObjectClean } from 'typelevel-ts/lib';
import { PartialKeys } from '@devexperts/utils/lib/object/object';

import detectorFactory from 'element-resize-detector';
import { raf } from '@devexperts/utils/lib/function/raf';

export const NativeResizeDetector = detectorFactory({
	strategy: 'scroll'
});

export const RESIZE_DETECTOR = Symbol('ResizeDetector');

export type TFullResizeDetectorProps = {
	theme: {
		container?: string
	},
	onResize: (element: Element) => any
};

@PURE
class RawResizeDetector extends React.Component<TFullResizeDetectorProps> {
	private element: HTMLDivElement | null;

	componentDidMount() {
		if (this.element) {
			NativeResizeDetector.listenTo(this.element, this.onResize);
		}
	}

	componentWillUnmount() {
		if (this.element) {
			NativeResizeDetector.uninstall(this.element);
		}
	}

	render() {
		const { theme } = this.props;
		return (
			<div className={theme.container} ref={el => this.element = el}></div>
		);
	}

	onResize = raf((element: Element) => {
		this.props.onResize(element);
	});
}

export type TResizeDetectorProps = ObjectClean<PartialKeys<TFullResizeDetectorProps, 'theme'>>;
export const ResizeDetector: ComponentClass<TResizeDetectorProps> = withTheme(RESIZE_DETECTOR)(RawResizeDetector);