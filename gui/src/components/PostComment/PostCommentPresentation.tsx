import * as React from "react";
import "@sdl/dd/PostComment/styles/PostComment";
import "@sdl/dd/Input/Input";
import "@sdl/dd/Textarea/Textarea";
import { IAppContext } from "@sdl/dd/container/App/App";
import * as ClassNames from "classnames";

export interface IPostCommentPresentationProps {
    handleSubmit: (event: React.FormEvent) => void;
}

export interface IPostCommentPresentationState {
    name: string;
    email: string;
    comment: string;
    edited: {
        name: boolean;
        email: boolean;
        comment: boolean;
    };
}

export interface IPC {
    [key: string]: boolean;
}

export class PostCommentPresentation extends React.Component<IPostCommentPresentationProps, IPostCommentPresentationState> {

    /**
     * Context types
     *
     * @static
     * @type {React.ValidationMap<IAppContext>}
     */
    public static contextTypes: React.ValidationMap<IAppContext> = {
        services: React.PropTypes.object.isRequired
    };

    /**
     * Global context
     *
     * @type {IAppContext}
     */
    public context: IAppContext;

    constructor() {
        super();
        this.state = {
            name: "",
            email: "",
            comment: "",
            edited: {
                name: false,
                email: false,
                comment: false
            }
        };
    }

    /**
     *
     * @param {React.KeyboardEvent} event
     *
     * @memberof PostCommentPresentation
     */
    public handleChange(event: React.KeyboardEvent): void {
        const htmlElement = event.nativeEvent.target as HTMLInputElement;
        this.setState({ ...this.state, [htmlElement.getAttribute("id") as string]: htmlElement.value });
    }

    /**
     *
     * @param {string} name
     * @param {string} email
     * @param {string} comment
     * @returns {IPC}
     *
     * @memberof PostCommentPresentation
     */
    public validateInput(name: string, email: string, comment: string): IPC {
        return {
            name: name.length === 0,
            email: email.length === 0,
            comment: comment.length === 0
        };
    }

    /**
     *
     * @param {React.FocusEvent} event
     *
     * @memberof PostCommentPresentation
     */
    public handleBlur(event: React.FocusEvent): void {
        const field = (event.nativeEvent.target as HTMLInputElement).getAttribute("id") as string;
        this.setState({...this.state, edited: { ...this.state.edited, [field]: true }});
    }

    /**
     *
     * @returns {JSX.Element}
     *
     * @memberof PostCommentPresentation
     */
    public render(): JSX.Element {
        const {name, email, comment} = this.state;
        const { formatMessage } = this.context.services.localizationService;
        const errors: IPC = this.validateInput(name, email, comment);
        const isDisabled = Object.keys(errors).some(key => errors[key]);

        const isError = (field: string) => {
            const hasError = errors[field];
            const shouldShow = (this.state.edited as IPC)[field];
            return hasError ? shouldShow : false;
        };

        const getInputClassNames = (field: string): string => {
            return ClassNames(
                "sdl-input-text",
                isError(field) ? "error" : ""
            );
        };
        const getTextareaClassNames = (field: string): string => {
            return ClassNames(
                "sdl-textarea",
                isError(field) ? "error" : ""
            );
        };

        return (
            <form className="sdl-dita-delivery-postcomment" onSubmit={this.props.handleSubmit}>
                <div>
                    <label htmlFor="name">{formatMessage("component.post.comment.name")}<span>*</span></label>
                    <input className={getInputClassNames("name")}
                        type="text"
                        id="name"
                        placeholder={formatMessage("component.post.comment.placeholder.name")}
                        onChange={this.handleChange.bind(this)}
                        onBlur={this.handleBlur.bind(this)} />
                    <span>{formatMessage("component.post.comment.no.name")}</span>
                </div>
                <div>
                    <label htmlFor="email">{formatMessage("component.post.comment.email")}<span>*</span></label>
                    <input className={getInputClassNames("email")}
                        type="text"
                        id="email"
                        placeholder={formatMessage("component.post.comment.placeholder.email")}
                        onChange={this.handleChange.bind(this)}
                        onBlur={this.handleBlur.bind(this)} />
                    <span>{formatMessage("component.post.comment.no.email")}</span>
                </div>
                <div>
                    <label htmlFor="comment">{formatMessage("component.post.comment.content")}<span>*</span></label>
                    <textarea className={getTextareaClassNames("comment")}
                        id="comment"
                        placeholder={formatMessage("component.post.comment.placeholder.content")}
                        onChange={this.handleChange.bind(this)}
                        onBlur={this.handleBlur.bind(this)}></textarea>
                    <span>{formatMessage("component.post.comment.no.content")}</span>
                </div>
                <div>
                    <input className="sdl-button graphene sdl-button-purpose-confirm"
                        type="submit" value={formatMessage("component.post.comment.submit")} disabled={isDisabled}/>
                </div>
            </form>
        );
    }
}
