import React, {
  MdMiscellaneousServices,
  MdOutlineAdb,
  MdOutlineEqualizer,
  MdOutlineForum,
  MdOutlineMonitorWeight,
  MdSettings,
} from 'react-icons/md';

export const menuIcons = [
  {
    id: 'conversations',
    icon: <MdOutlineForum />,
  },
  {
    id: 'training',
    icon: <MdOutlineAdb />,
  },
  {
    id: 'analytics',
    icon: <MdOutlineEqualizer />,
  },
  {
    id: 'services',
    icon: <MdMiscellaneousServices />,
  },
  {
    id: 'settings',
    icon: <MdSettings />,
  },
  {
    id: 'monitoring',
    icon: <MdOutlineMonitorWeight />,
  },
];
