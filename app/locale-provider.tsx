'use client';
/* eslint-disable react-hooks/set-state-in-effect -- Restore device-only preferences after hydration without changing the server-rendered HTML. */
import {Children,createContext,useContext,useCallback,useEffect,useState,useMemo,cloneElement,isValidElement,type ReactNode,type ReactElement} from 'react';
import {translate,localizedWiki,type Locale} from '@/lib/i18n/translate';
import {symbolizeText} from './item-symbols';
type LocaleContextValue={locale:Locale;setLocale:(locale:Locale)=>void;effects:boolean;setEffects:(enabled:boolean)=>void;taskLimit:3|5|99;setTaskLimit:(limit:number)=>void};
const LocaleContext=createContext<LocaleContextValue>({locale:'en',setLocale:()=>{},effects:true,setEffects:()=>{},taskLimit:5,setTaskLimit:()=>{}});
export function LocaleProvider({children}:{children:ReactNode}){
 const[locale,setLanguage]=useState<Locale>('en');const[effects,setMotion]=useState(true);const[taskLimit,setLimit]=useState<3|5|99>(5);
 useEffect(()=>{try{const saved=localStorage.getItem('pelican-planner-language')??localStorage.getItem('farm-journal-language');const choice=saved==='zh-CN'||saved==='en'?saved:navigator.language.toLowerCase().startsWith('zh')?'zh-CN':'en';setLanguage(choice);const effectsSaved=localStorage.getItem('pelican-planner-effects')??localStorage.getItem('farm-journal-effects');setMotion(effectsSaved!=='off');const limit=Number(localStorage.getItem('pelican-planner-task-limit')??localStorage.getItem('farm-journal-task-limit'));if(limit===3||limit===5||limit===99)setLimit(limit);}catch{}},[]);
 useEffect(()=>{document.documentElement.lang=locale;document.documentElement.dataset.effects=effects?'on':'off';document.title=translate('Pelican Planner',locale);},[locale,effects,taskLimit]);
 const value=useMemo(()=>({locale,effects,taskLimit,setTaskLimit:(next:number)=>{if(next!==3&&next!==5&&next!==99)return;setLimit(next);try{localStorage.setItem('pelican-planner-task-limit',String(next))}catch{}},setLocale:(next:Locale)=>{setLanguage(next);try{localStorage.setItem('pelican-planner-language',next)}catch{}},setEffects:(next:boolean)=>{setMotion(next);try{localStorage.setItem('pelican-planner-effects',next?'on':'off')}catch{}}}),[locale,effects,taskLimit]);
 return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}
// Translate only display text and accessible labels. IDs, form values, event handlers,
// and saved game identifiers are untouched. No DOM mutation or HTML injection.
export function renderLocalized(node:ReactNode,locale:Locale):ReactNode{
 if(typeof node==='string')return symbolizeText(translate(node,locale),locale);
 if(Array.isArray(node))return Children.map(node,child=>renderLocalized(child,locale));
 if(!isValidElement(node))return node;
 const element=node as ReactElement<Record<string,unknown>>;const props=element.props;
 if(props.translate==='no')return node;
 if(element.type==='option'||element.type==='textarea'||element.type==='script'||element.type==='style')return node;
 const changes:Record<string,unknown>={};
 for(const key of ['aria-label','title','placeholder','alt'])if(typeof props[key]==='string')changes[key]=translate(props[key],locale);
 if(typeof props.href==='string')changes.href=localizedWiki(props.href,locale);
 if('children' in props)changes.children=renderLocalized(props.children as ReactNode,locale);
 return cloneElement(element,changes);
}
export function useLocale(){const context=useContext(LocaleContext);const locale=context.locale;const t=useCallback((text:string)=>translate(text,locale),[locale]);const render=useCallback((node:ReactNode)=>renderLocalized(node,locale),[locale]);return {...context,t,render};}
export function LanguageSwitch(){const{locale,setLocale}=useLocale();return <div className="language-switch" role="group" aria-label="Language / 语言" translate="no"><button type="button" lang="en" className={'btn compact '+(locale==='en'?'selected':'')} aria-pressed={locale==='en'} onClick={()=>setLocale('en')}>English</button><button type="button" lang="zh-CN" className={'btn compact '+(locale==='zh-CN'?'selected':'')} aria-pressed={locale==='zh-CN'} onClick={()=>setLocale('zh-CN')}>简体中文</button></div>}
