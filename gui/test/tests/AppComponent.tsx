/// <reference path="../../src/components/App.tsx" />

module Sdl.KcWebApp.Tests {

    import App = Components.App;

    class AppComponent extends SDL.Client.Test.TestBase {

        public runTests(): void {

            describe(`App component tests.`, (): void => {
                const target = super.createTargetElement();

                beforeAll(() => {
                    ReactDOM.render(<App/>, target);
                });

                afterAll(() => {
                    const domNode = ReactDOM.findDOMNode(target);
                    ReactDOM.unmountComponentAtNode(domNode);
                    target.parentElement.removeChild(target);
                });

                it("renders", (): void => {
                    const domNode = ReactDOM.findDOMNode(target) as HTMLElement;
                    expect(domNode).not.toBeNull();
                    expect(domNode.textContent).toBe("Hello world!");
                });

            });

        }
    }

    new AppComponent().runTests();
}
