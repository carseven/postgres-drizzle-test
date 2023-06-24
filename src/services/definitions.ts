export type Result =
    | {
          success: true;
      }
    | {
          success: false;
          errorMessage: string;
      };
