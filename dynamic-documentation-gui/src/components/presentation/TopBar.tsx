import * as React from "react";
import * as PropTypes from "prop-types";
import { IndexLink } from "react-router";
import { path } from "utils/Path";
import { LanguageDropdown } from "@sdl/dd/Dropdown/LanguageDropdown";
import { IAppContext } from "@sdl/dd/container/App/App";

import "./styles/TopBar";

/**
 * TopBar props
 *
 * @export
 * @interface ITopBarProps
 */
export interface ITopBarProps {
    /**
     * Children
     *
     * @type {React.ReactNode}
     * @memberOf INavigationMenuProps
     */
    children?: React.ReactNode;
}

/**
 * TopBar
 */
export const TopBar: React.StatelessComponent<ITopBarProps> = (props: ITopBarProps, context: IAppContext): JSX.Element => {
    const { children } = props;

    return (
        <div className={"sdl-dita-delivery-topbar"}>
            <header>
                <div className={"sdl-dita-delivery-topbar-logo"} title="SDL">
                    <IndexLink to={`${path.getRootPath()}home`} />
                </div>
                <div className={"spacer"} />
                {children}
                <div className={"sdl-dita-delivery-topbar-language"} >
                    <span />
                </div>
                <LanguageDropdown />
                <div className={"sdl-dita-delivery-topbar-user"} >
                    <span />
                </div>
            </header>
        </div>
    );
};

TopBar.contextTypes = {
    services: PropTypes.object.isRequired
} as React.ValidationMap<IAppContext>;