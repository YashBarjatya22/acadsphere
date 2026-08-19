import { c as createSsrRpc } from "./createSsrRpc-B5NaTOOc.js";
import { a as createServerFn } from "./server-CTRvd-y5.js";
import { z } from "zod";
createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
}).parse(input)).handler(createSsrRpc("b272cbeb163c485d101e80b1bb37e8ff29ffa31bbe3eb6a24d063016c2ed628a"));
const localDemoLogin = createServerFn({
  method: "POST"
}).inputValidator((input) => z.object({
  email: z.string().email(),
  password: z.string().min(1),
  name: z.string().optional()
}).parse(input)).handler(createSsrRpc("9b075d64629f28a178b2216ca82061a296e868b579ed47ce954ba0b92c063625"));
export {
  localDemoLogin as l
};
