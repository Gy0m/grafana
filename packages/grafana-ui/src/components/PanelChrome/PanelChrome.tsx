import { css, cx } from '@emotion/css';
import React, { CSSProperties, ReactNode } from 'react';

import { GrafanaTheme2 } from '@grafana/data';

import { useStyles2, useTheme2 } from '../../themes';
import { Icon } from '../Icon/Icon';

/**
 * @internal
 */
export interface PanelChromeProps {
  title?: string;
  items?: {
    orderedList: ReactNode[];
    position?: 'left' | 'right'; // Default is 'left'
  };
  actionItems?: {
    orderedList: ReactNode[];
    position?: 'left' | 'right'; // Default is 'left'
    show?: 'always' | 'hover' | 'never'; // Default is 'hover'
  };
  width: number;
  height: number;
  padding?: PanelPadding;
  leftItems?: ReactNode[]; // rightItems will be added later (actions links etc.)
  children: (innerWidth: number, innerHeight: number) => ReactNode;
}

/**
 * @internal
 */
export type PanelPadding = 'none' | 'md';

/**
 * @internal
 */
export const PanelChrome: React.FC<PanelChromeProps> = ({
  title = '',
  items,
  actionItems,
  width,
  height,
  padding = 'md',
  leftItems = [],
  children,
}) => {
  const theme = useTheme2();
  const styles = useStyles2(getStyles);

  const headerHeight = getHeaderHeight(theme, title, leftItems);
  const { contentStyle, innerWidth, innerHeight } = getContentStyle(padding, theme, width, headerHeight, height);

  const headerStyles: CSSProperties = {
    height: headerHeight,
  };
  const itemStyles: CSSProperties = {
    minHeight: headerHeight,
    minWidth: headerHeight,
  };
  const containerStyles: CSSProperties = { width, height };

  return (
    <div className={styles.container} style={containerStyles}>
      {
        // todo handle only the "hidden: false" case
        title.length > 0 && (
          <div className={styles.headerContainer} style={headerStyles}>
            <div className={styles.title}>{title}</div>

            {items && Array.isArray(items.orderedList) && items.orderedList.length > 0 && (
              <div className={cx({ [styles.rightAligned]: items.position === 'right' }, styles.items)}>
                {itemsRenderer(items.orderedList, (validItems: ReactNode[]) =>
                  validItems.map((item, i) => (
                    <div key={i} className={styles.item} style={itemStyles}>
                      {item}
                    </div>
                  ))
                )}
              </div>
            )}
            {/* todo hide/show on hover if show = 'hover' */}
            {actionItems && Array.isArray(actionItems.orderedList) && actionItems.orderedList.length > 0 && (
              <div className={cx({ [styles.rightAligned]: actionItems.position === 'right' }, styles.items)}>
                {itemsRenderer(actionItems.orderedList, (validItems: ReactNode[]) =>
                  validItems.map((item, i) => (
                    <div key={i} className={styles.item} style={itemStyles}>
                      {item}
                    </div>
                  ))
                )}
              </div>
            )}

            {leftItems.length > 0 && (
              <div className={cx(styles.rightAligned, styles.items)}>{itemsRenderer(leftItems, (item) => item)}</div>
            )}
          </div>
        )
        // : (
        //   // TODO: Create headerless behavior (title, menu, etc shown on focus/hover, drag handler is present, etc..)
        //   <div className={styles.headerContainer} style={headerStyles}>
        //     <div className={styles.dragIcon}>{<Icon name="draggabledots" size="sm" />}</div>
        //     <div className={styles.edit}>
        //       {<Icon name="clock-nine" size="sm" />}
        //       {<Icon name="heart-rate" size="sm" />}
        //     </div>
        //     <div className={styles.menu}>{<Icon name="ellipsis-v" size="sm" />}</div>
        //     <div className={styles.status}>{<Icon name="fa fa-spinner" size="sm" />}</div>
        //   </div>
        // )
      }

      <div className={styles.content} style={contentStyle}>
        {children(innerWidth, innerHeight)}
      </div>
    </div>
  );
};

const itemsRenderer = (items: ReactNode[], renderer: (itemsss: ReactNode[]) => ReactNode): ReactNode => {
  const toRender = React.Children.toArray(items).filter(Boolean);
  return toRender.length > 0 ? renderer(toRender) : null;
};

const getHeaderHeight = (theme: GrafanaTheme2, title: string, items: ReactNode[]) => {
  if (title.length > 0 || items.length > 0) {
    return theme.spacing.gridSize * theme.components.panel.headerHeight;
  }
  return 0;
};

const getContentStyle = (
  padding: string,
  theme: GrafanaTheme2,
  width: number,
  headerHeight: number,
  height: number
) => {
  const chromePadding = (padding === 'md' ? theme.components.panel.padding : 0) * theme.spacing.gridSize;
  const panelBorder = 1 * 2;
  const innerWidth = width - chromePadding * 2 - panelBorder;
  const innerHeight = height - headerHeight - chromePadding * 2 - panelBorder;

  const contentStyle: CSSProperties = {
    padding: chromePadding,
  };

  return { contentStyle, innerWidth, innerHeight };
};

const getStyles = (theme: GrafanaTheme2) => {
  const { padding, background, borderColor } = theme.components.panel;

  return {
    container: css({
      label: 'panel-container',
      backgroundColor: background,
      border: `1px solid ${borderColor}`,
      position: 'relative',
      borderRadius: '3px',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      flex: '0 0 0',
    }),
    content: css({
      label: 'panel-content',
      width: '100%',
      flexGrow: 1,
    }),
    headerContainer: css({
      label: 'panel-header',
      display: 'flex',
      alignItems: 'center',
      padding: `0 ${theme.spacing(padding)}`,
      // todo see if we can just have headerHeight calc here
    }),
    title: css({
      textOverflow: 'ellipsis',
      overflow: 'hidden',
      whiteSpace: 'nowrap',
      fontWeight: theme.typography.fontWeightMedium,
    }),
    items: css({
      display: 'flex',
      // todo arrange when items take up more space than section is allowed to
      // overflow: 'overlay',
    }),
    item: css({
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
    }),
    rightAligned: css({
      // todo margin left is not the best when >= set of items are put on the right
      marginLeft: 'auto',
    }),
  };
};
