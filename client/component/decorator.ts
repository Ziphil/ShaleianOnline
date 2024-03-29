//

import {
  inject,
  observer
} from "mobx-react";
import {
  ComponentClass
} from "react";
import css from "react-css-modules";
import {
  IntlShape,
  injectIntl
} from "react-intl";
import {
  RouteComponentProps
} from "react-router";
import {
  withRouter
} from "react-router-dom";
import {
  GlobalStore
} from "/client/component/store";


export function style(style: any, options: DecoratorOptions = {}): any {
  const nextOptions = Object.assign({}, DEFAULT_DECORATOR_OPTIONS, options);
  const decorator = function <P, C extends ComponentClass<P>>(component: any): ComponentClass<P> & C {
    if (style !== null && style !== undefined) {
      component = css(style, {allowMultiple: true, handleNotFoundStyleName: "ignore"})(component);
    }
    if (nextOptions.observer) {
      component = wrappedObserver(component);
    }
    if (nextOptions.withRouter) {
      component = wrappedWithRouter(component);
    }
    if (nextOptions.inject) {
      component = wrappedInject(component);
    }
    if (nextOptions.injectIntl) {
      component = wrappedInjectIntl(component);
    }
    return component;
  };
  return decorator as any;
}

function wrappedWithRouter<P extends Partial<RouteComponentProps<any>>, C extends ComponentClass<P>>(component: ComponentClass<P> & C): ComponentClass<P> & C {
  const anyComponent = component as any;
  const resultComponent = withRouter(anyComponent) as any;
  return resultComponent;
}

function wrappedInject<P extends {store?: GlobalStore}, C extends ComponentClass<P>>(component: ComponentClass<P> & C): ComponentClass<P> & C {
  return inject("store")(component);
}

function wrappedInjectIntl<P extends {intl?: IntlShape}, C extends ComponentClass<P>>(component: ComponentClass<P> & C): ComponentClass<P> & C {
  const anyComponent = component as any;
  const resultComponent = injectIntl(anyComponent) as any;
  return resultComponent;
}

function wrappedObserver<P extends any, C extends ComponentClass<P>>(component: ComponentClass<P> & C): ComponentClass<P> & C {
  return observer(component);
}

type DecoratorOptions = {
  withRouter?: boolean,
  inject?: boolean,
  injectIntl?: boolean,
  observer?: boolean
};
const DEFAULT_DECORATOR_OPTIONS = {
  withRouter: true,
  inject: true,
  injectIntl: true,
  observer: false
};