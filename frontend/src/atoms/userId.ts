import { atom } from "recoil";

export const userIdAtom = atom({
	key: "counter",
	default: `user-${Math.floor(Math.random() * 10000)}`
})