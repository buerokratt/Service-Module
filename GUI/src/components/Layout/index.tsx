import React, { FC, PropsWithChildren, ReactNode } from "react";
import { Outlet } from "react-router-dom";

import { MainNavigation, Header } from "../../components";
import "./Layout.scss";

type LayoutProps = {
  disableMenu?: boolean;
  customHeader?: ReactNode;
};

const Layout: FC<PropsWithChildren<LayoutProps>> = ({
  disableMenu,
  customHeader,
  children,
}) => {
  return (
    <div className="layout">
      {!disableMenu && <MainNavigation />}
      <div className="layout__wrapper">
        {customHeader ?? <Header />}
        <main className="layout__main">{children ?? <Outlet />}</main>
      </div>
    </div>
  );
};

export default Layout;
