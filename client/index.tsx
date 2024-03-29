//

import * as react from "react";
import {
  render
} from "react-dom";
import {
  Root
} from "/client/component/root";


export class Main {

  public main(): void {
    this.appendIconElement();
    this.render();
  }

  private render(): void {
    render(<Root/>, document.getElementById("root"));
  }

  private appendIconElement(): void {
    const element = document.createElement("link");
    element.href = "https://kit-free.fontawesome.com/releases/latest/css/free.min.css";
    element.rel = "stylesheet";
    element.media = "all";
    document.head.appendChild(element);
  }

}


const main = new Main();
main.main();