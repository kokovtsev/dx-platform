import * as React from 'react';
import { PURE } from '../../utils/pure';
import { ComponentClass, ComponentType, ReactElement } from 'react';
import * as ReactDOM from 'react-dom';
import { withTheme } from '../../utils/withTheme';
import { PartialKeys } from '@devexperts/utils/dist/object/object';
import { ButtonIcon, TButtonIconProps } from '../ButtonIcon/ButtonIcon';
import { Input, TInputProps } from '../input/Input';
import { KeyCode } from '../Control/Control';
import { Holdable } from '../Holdable/Holdable';
import { withDefaults } from '../../utils/with-defaults';
import { constUndefined } from 'fp-ts/lib/function';

export const STEPPABLE_INPUT = Symbol('SteppableInput') as symbol;

export type TPickedInputProps = Pick<TInputProps, 'error' | 'onBlur' | 'onFocus' | 'onKeyDown' | 'onClick'>;

export type TFullSteppableInputProps = TPickedInputProps & {
	isDisabled?: TInputProps['isDisabled'];
	tabIndex?: number;
	onIncrement?: Function;
	onDecrement?: Function;
	onClear?: Function;
	incrementIcon?: ReactElement<any>;
	decrementIcon?: ReactElement<any>;
	clearIcon?: ReactElement<any>;
	children?: any;
	Input: ComponentType<TInputProps>;
	ButtonIcon: ComponentType<TButtonIconProps>;
	theme: {
		inner?: string;
		Input?: TInputProps['theme'];
		ButtonIcon?: TButtonIconProps['theme'];
		ClearButtonIcon?: TButtonIconProps['theme'];
	};
};

type TSteppableInputState = {
	isFocused?: boolean;
};

@PURE
class RawSteppableInput extends React.Component<TFullSteppableInputProps, TSteppableInputState> {
	readonly state: TSteppableInputState = {};

	componentDidUpdate(prevProps: TFullSteppableInputProps) {
		if (prevProps.onClear && !this.props.onClear) {
			//when removing clear button from dom component wierdly loses focus
			const element = ReactDOM.findDOMNode(this) as HTMLElement;
			element.focus();
		}
	}

	render() {
		const {
			isDisabled,
			error,
			theme,
			children,
			tabIndex,
			decrementIcon,
			incrementIcon,
			clearIcon,
			onIncrement,
			onDecrement,
			onClear,
			onClick,
			Input,
			ButtonIcon,
		} = this.props;

		const { isFocused } = this.state;

		return (
			<Input
				value={undefined}
				onValueChange={constUndefined}
				theme={theme.Input}
				type="hidden"
				onFocus={this.onFocus}
				onBlur={this.onBlur}
				onKeyDown={this.onKeyDown}
				onClick={onClick}
				onWheel={this.onWheel}
				isDisabled={isDisabled}
				error={error}
				tabIndex={isFocused || isDisabled ? -1 : tabIndex || 0}>
				<div className={theme.inner}>
					{children}
					{onClear &&
						clearIcon && (
							<ButtonIcon
								icon={clearIcon}
								isFlat={true}
								theme={theme.ClearButtonIcon}
								onClick={this.onClearClick}
								onMouseDown={this.onButtonMouseDown}
								isDisabled={isDisabled}
								tabIndex={-1}
							/>
						)}
					{onDecrement &&
						decrementIcon && (
							<Holdable onHold={onDecrement}>
								<ButtonIcon
									icon={decrementIcon}
									theme={theme.ButtonIcon}
									onClick={this.onDecrementClick}
									onMouseDown={this.onButtonMouseDown}
									isDisabled={isDisabled}
									tabIndex={-1}
								/>
							</Holdable>
						)}
					{onIncrement &&
						incrementIcon && (
							<Holdable onHold={onIncrement}>
								<ButtonIcon
									icon={incrementIcon}
									theme={theme.ButtonIcon}
									onClick={this.onIncrementClick}
									onMouseDown={this.onButtonMouseDown}
									isDisabled={isDisabled}
									tabIndex={-1}
								/>
							</Holdable>
						)}
				</div>
			</Input>
		);
	}

	private onClearClick = () => {
		const { onClear } = this.props;
		onClear && onClear();
	};

	private onIncrementClick = () => {
		const { onIncrement } = this.props;
		onIncrement && onIncrement();
	};

	private onDecrementClick = () => {
		const { onDecrement } = this.props;
		onDecrement && onDecrement();
	};

	private onButtonMouseDown = (e: React.MouseEvent<HTMLElement>) => {
		if (this.state.isFocused) {
			e.preventDefault();
		}
	};

	private onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
		if (!this.props.isDisabled && !this.state.isFocused) {
			this.setState({
				isFocused: true,
			});
			this.props.onFocus && this.props.onFocus(e);
		}
	};

	private onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
		if (!this.props.isDisabled && this.state.isFocused) {
			this.setState({
				isFocused: false,
			});
			this.props.onBlur && this.props.onBlur(e);
		}
	};

	private onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (!this.props.isDisabled) {
			switch (e.keyCode) {
				case KeyCode.Up: {
					this.props.onIncrement && this.props.onIncrement();
					break;
				}
				case KeyCode.Down: {
					this.props.onDecrement && this.props.onDecrement();
					break;
				}
			}
			this.props.onKeyDown && this.props.onKeyDown(e);
		}
	};

	private onWheel = (e: React.WheelEvent<HTMLElement>) => {
		const { isDisabled, onIncrement, onDecrement } = this.props;
		const { isFocused } = this.state;

		if (!isDisabled && isFocused) {
			e.preventDefault(); //block v-scrolling
			if (e.deltaY < 0) {
				onIncrement && onIncrement();
			} else {
				onDecrement && onDecrement();
			}
		}
	};
}

export type TSteppableInputProps = PartialKeys<TFullSteppableInputProps, 'theme' | 'Input' | 'ButtonIcon'>;
export const SteppableInput: ComponentClass<TSteppableInputProps> = withTheme(STEPPABLE_INPUT)(
	withDefaults<TFullSteppableInputProps, 'Input' | 'ButtonIcon'>({
		Input,
		ButtonIcon,
	})(RawSteppableInput),
);

export function checkParentsUpTo(node?: Element | null, checkNode?: Element, upToNode?: Element): boolean {
	if (!node || !checkNode || !upToNode) {
		return false;
	} else if (node === upToNode) {
		return false;
	} else if (node === checkNode) {
		return true;
	} else {
		return checkParentsUpTo(node.parentElement, checkNode, upToNode);
	}
}
