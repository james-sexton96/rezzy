import {ResumeSchema} from "@kurone-kito/jsonresume-types";

export type ArrayItem<T> = T extends Array<infer U> ? U : never;
export type Skill = ArrayItem<ResumeSchema["skills"]>;
export type Work = ArrayItem<ResumeSchema["work"]>;
export type Education = ArrayItem<ResumeSchema["education"]>;
export type Certificate = ArrayItem<ResumeSchema["certificates"]>;
export type Interest = ArrayItem<ResumeSchema["interests"]>;
