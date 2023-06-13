import type { TAction } from '../constants/action';
import type { Customizations, IConfig } from '../utils/config';

export type ContextProps = {
  config: IConfig;
  customizations?: Customizations;
  children?: React.ReactNode;
};

export type Dispatch = (action: TAction) => void;

export type GlobalState = {
  // is_initializing: boolean;
  // is_container_visible: boolean;
  // use_modal: boolean;
  // nav: {
  //   current_route: string;
  //   route_trigger: string;
  //   event_id: string;
  //   section: string;
  //   options?: any;
  // };
  user: {
    data: {
      id?: string;
      email?: string | null;
      [key: string]: any;
    };
    // needs_refresh?: boolean;
    // redacted: string[];
  };
  auth: {
    access_token: string | null;
    refresh_token: string | null;
    app_id: string | null;
    init_data?: Record<string, any>;
    is_verified_user?: boolean;
  };
  app: {
    id?: string;
    icon?: string;
    icon_content_type?: string;
    config: AppConfig | null;
    schema: AppSchema | null;
    user_verification_field?: string;
    user_verification_fields?: string[];
  };
  // local_acls: Record<string, { shared: boolean }> | null;
  // is_saving_user_data: boolean;
  config?: IConfig;
};

type AppSchema = Record<string, SchemaField>;

export interface SchemaField {
  display_name: string;
  type: string;
  data_category: string;
  required: boolean;
  owned_by: string;
  user_visible: boolean;
  revoke_after: string;
  required_retention: string;
  collection_justification: string;
  opt_out_warning: string;
}

export interface AppConfig {
  customizations: {
    primary_color: string;
  };
  default_user_id_format?: string;
  hub: {
    auth: {
      allow_unverified_users?: boolean;
      additional_fields: [
        {
          name: string;
          type: string;
          label: string;
          placeholder?: string;
          options: [
            {
              value: string;
              label: string;
            }
          ];
        }
      ];
      email: {
        from_address: string;
        image: string;
      };
      show_app_icon: boolean;
    };
    customizations: HubCustomizations;
  };
}

export interface HubCustomizations {
  rounded_corners: boolean;
  primary_color: string;
  placement: 'bottom-left' | 'hidden';
  offset_x: number;
  offset_y: number;
  property_overrides: Record<string, string>;
}
