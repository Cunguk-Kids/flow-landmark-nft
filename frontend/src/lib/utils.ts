import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatedDateRange(range: any) {

}

export const cleanFlowType = (typeStr: string) => {
  return typeStr
    .replace(/^Type<|>\(\)$/g, '') // Hapus 'Type<' di awal dan '>()' di akhir
    .replace(/>$/, '');             // Jaga-jaga jika formatnya cuma 'Type<...>'
};