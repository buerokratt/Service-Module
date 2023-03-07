import React, { FC, MouseEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { NavLink, useLocation } from "react-router-dom";
import { MdClose, MdKeyboardArrowDown } from "react-icons/md";
import clsx from "clsx";

import { Icon } from "../../components";
import type { MenuItem } from "../../types/mainNavigation";
import { menuIcons } from "../../constants/menuIcons";
import "./MainNavigation.scss";

const MainNavigation: FC = () => {
  const { t } = useTranslation();
  const location = useLocation();
  const [navCollapsed, setNavCollapsed] = useState(false);

  const menuItems = [
    {
      id: "conversations",
      label: "Vestlus",
      path: "/vestlus",
      children: [],
    },
    {
      id: "training",
      label: "Treening",
      path: "/treening",
      children: [
        {
          label: "Treening",
          path: "/treening/treening",
          children: [
            {
              label: "Teemad",
              path: "/treening/treening/teemad",
            },
            {
              label: "Avalikud teemad",
              path: "/treening/treening/avalikud-teemad",
            },
            {
              label: "Teemade järeltreenimine",
              path: "/treening/treening/teemade-jareltreenimine",
            },
            {
              label: "Vastused",
              path: "/treening/treening/vastused",
            },
            {
              label: "Kasutuslood",
              path: "/treening/treening/kasutuslood",
            },
            {
              label: "Konfiguratsioon",
              path: "/treening/treening/konfiguratsioon",
            },
            {
              label: "Vormid",
              path: "/treening/treening/vormid",
            },
            {
              label: "Mälukohad",
              path: "/treening/treening/malukohad",
            },
          ],
        },
        {
          label: "Ajaloolised vestlused",
          path: "/treening/ajaloolised-vestlused",
          children: [
            {
              label: "Ajalugu",
              path: "/treening/ajaloolised-vestlused/ajalugu",
            },
            {
              label: "Pöördumised",
              path: "/treening/ajaloolised-vestlused/poordumised",
            },
          ],
        },
        {
          label: "Mudelipank ja analüütika",
          path: "/treening/mudelipank-ja-analuutika",
          children: [
            {
              label: "Teemade ülevaade",
              path: "/treening/mudelipank-ja-analuutika/teemade-ulevaade",
            },
            {
              label: "Mudelite võrdlus",
              path: "/treening/mudelipank-ja-analuutika/mudelite-vordlus",
            },
            {
              label: "Testlood",
              path: "/treening/mudelipank-ja-analuutika/testlood",
            },
          ],
        },
        {
          label: "Treeni uus mudel",
          path: "/treening/treeni-uus-mudel",
        },
      ],
    },
    {
      id: "analytics",
      label: "Analüütika",
      path: "/analytics",
      children: [
        {
          label: "Ülevaade",
          path: "/analytics/overview",
        },
        {
          label: "Vestlused",
          path: "/analytics/chats",
        },
        {
          label: "Bürokratt",
          path: "/analytics/burokratt",
        },
        {
          label: "Tagasiside",
          path: "/analytics/feedbacks",
        },
        {
          label: "Nõustajad",
          path: "/analytics/advisors",
        },
        {
          label: "Avaandmed",
          path: "/analytics/reports",
        },
      ],
    },
    {
      id: "services",
      label: t("global.services"),
      path: "/services",
      children: [
        {
          label: t("menu.overview"),
          path: "/services/overview",
        },
        {
          label: t("menu.newService"),
          path: "/services/newService",
        },
      ],
    },
    {
      id: "settings",
      label: "Haldus",
      path: "/haldus",
      children: [],
    },
    {
      id: "monitoring",
      label: "Seire",
      path: "/seire",
      children: [],
    },
  ];

  const handleNavToggle = (event: MouseEvent) => {
    const isExpanded =
      event.currentTarget.getAttribute("aria-expanded") === "true";
    event.currentTarget.setAttribute(
      "aria-expanded",
      isExpanded ? "false" : "true"
    );
  };

  const renderMenuTree = (menuItems: MenuItem[]) => {
    return menuItems.map((menuItem) => (
      <li key={menuItem.label}>
        {menuItem.children ? (
          <>
            <button
              className={clsx("nav__toggle", {
                "nav__toggle--icon": !!menuItem.id,
              })}
              aria-expanded={
                menuItem.path && location.pathname.includes(menuItem.path)
                  ? "true"
                  : "false"
              }
              onClick={handleNavToggle}
            >
              {menuItem.id && (
                <Icon
                  icon={menuIcons.find((icon) => icon.id === menuItem.id)?.icon}
                />
              )}
              <span>{menuItem.label}</span>
              <Icon icon={<MdKeyboardArrowDown />} />
            </button>
            <ul className="nav__submenu">
              {renderMenuTree(menuItem.children)}
            </ul>
          </>
        ) : (
          <NavLink to={menuItem.path || "#"}>{menuItem.label}</NavLink>
        )}
      </li>
    ));
  };

  return (
    <nav className={clsx("nav", { "nav--collapsed": navCollapsed })}>
      <button
        className="nav__menu-toggle"
        onClick={() => setNavCollapsed(!navCollapsed)}
      >
        <Icon icon={<MdClose />} />
        {t("menu.close")}
      </button>
      <ul className="nav__menu">{renderMenuTree(menuItems)}</ul>
    </nav>
  );
};

export default MainNavigation;
