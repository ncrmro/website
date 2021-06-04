import type { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();

const { key, phoneNumber, email } = JSON.parse(
  serverRuntimeConfig.CONTACT_INFO_JSON
);

/**
 * If we get correct url param password return contact info JSON from envrionment variable
 * @param req
 * @param res
 */
export default (req: NextApiRequest, res: NextApiResponse) => {
  if (req.query.password === key) {
    res.status(200).json({ phoneNumber, email });
  } else {
    res
      .status(401)
      .json({ error: "Incorrect or missing password query param" });
  }
};
